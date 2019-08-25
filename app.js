require('array.prototype.flatmap').shim()

const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require('@elastic/elasticsearch');
const stackTraceParser = require('stacktrace-parser');

// configuration
const elastic_endpoint = process.env.ELASTIC_ENDPOINT || "http://elasticsearch:9200";
const elastic_metrics_index = process.env.ELASTIC_METRIC_INDEX || "event-loop-metrics";
const port = process.env.PORT || 3001;

const client = new Client({ node: elastic_endpoint });
const app = express();
app.use(bodyParser.json());

async function initElastic() {
	const mappings = {
		properties: {
			time:  { type: 'date' },
			event: { type: 'keyword' },
			app: { type: 'keyword' },
			appVersion: {type: 'keyword' },
			hostname: { type: 'keyword' },
			functionName: { type: 'keyword' },
			lineNumber: { type: 'integer' },
			column: { type: 'integer' },
			userCode: { type: 'boolean' },
			file: { type: 'keyword' },
			blockedFor: { type: 'integer' },
			blockCodeId: { type: 'keyword' },
			stack: { type: 'text' },
		}
	}

	await client.indices.create({
		index: elastic_metrics_index,
		body: {
			mappings
		}
	}, { ignore: [400] });
}

app.post('/eventloop', async (req, res) => {
	const stats = req.body;

	const { stack, blockedFor, event } = stats;
	const stackFrames = stackTraceParser.parse(stack);
	const topFrame = stackFrames[0];
	const { hostname, app, appVersion, } = stats.agents[0].info;
	const { file, methodName, lineNumber, column } = topFrame;

	// need some logic for js lib function
	const userCode = !file.split("/").includes("node_modules");

	const dataset = [{
		time: new Date(stats.time),
		event, app, appVersion, hostname,
		column, lineNumber, functionName: methodName, userCode, file,
		blockCodeId: [ methodName, lineNumber, column ].join(":"),
		blockedFor, stack,
	}];

	//TODO: send bulk events and not only one document
	const body = dataset.flatMap(doc => [{ index: { _index: elastic_metrics_index } }, doc])

	const { body: bulkResponse } = await client.bulk({ refresh: true, body });
	res.sendStatus(200);
});

initElastic().then(() => {
	app.listen(port, () => { 
		console.log(`Starting event loop monitor service on port ${port}`)
	});
}).catch(console.error);

