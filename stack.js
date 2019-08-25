	const stack =  "    at waitAround (/Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/lib/wait-around.js:3:3)\n    at app.get (/Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/index.js:15:9)\n    at handle (/Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/node_modules/express/lib/router/layer.js:95:5)\n    at next (/Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/node_modules/express/lib/router/route.js:137:13)\n    at dispatch (/Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/node_modules/express/lib/router/route.js:112:3)\n    at handle (/Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/node_modules/express/lib/router/layer.js:95:5)\n    at /Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/node_modules/express/lib/router/index.js:281:22\n    at process_params (/Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/node_modules/express/lib/router/index.js:335:12)\n    at next (/Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/node_modules/express/lib/router/index.js:275:10)\n    at expressInit (/Users/aviad.shikloshi/projects/snyk/sre-exercise-sample-app/node_modules/express/lib/middleware/init.js:40:5)";

// add try end catch
function parseStack() { 
	const topFrame = stack.split('\n')[0];
	console.log(topFrame.trim(" "));

	const parts = topFrame.trim(" ").split(" ");
	console.log(parts);
	console.log(parts[parts.length-1].trim("("));

	// use files to check if node modules are there
	const isModule = parts[2].includes("/node_module/");

	const files = parts[2].split("/");
	const jsFileDescription = files[files.length - 1];
	console.log(files);
	const lineNumber = jsFileDescription.split(":")[1];
	console.log(lineNumber);
	console.log(jsFileDescription);

	const ret = {
		fileName: jsFileDescription.split(":")[0],
		lineNumber,
		functionName: parts[1], 
		isModule,
	}
	console.log(ret);

	return ret;
}

parseStack(stack);
