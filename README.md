### Install / Run 
-----

Set NSolid webhook endpoint to: `/eventloop`, and specify the port which the metric server is running on (default to `3001`)

```bash
docker-composes build && docker-compoes up
```

This will spin up 3 containers:

1. Elatsicsearch "cluster" (single node and no configuration)

2. Kibana container that comunicate with the above ES "cluster"

3. Very(!) simple node.js server to handle all webhooks from NSolid

The next thing would be to use `bin/blast` (add the link here) inside snyk project to generate some data we can observe. and go over to the next part.

##### Environment Variables Configuration
 
* `PORT` - metric-service server listen port, this should be set on NSolid. default: `3001`
* `ELASTIC_ENDPOINT` - the endpoint for elasticsearch node. Default to `http://elasticsearch:9200`
* `ELASTIC_METRIC_INDEX` - ES index to send eventss to. Default to `event-loop-metric`


### Solution considurations
-----

Choosing elasticsearch due to it's over-time abilities, my prior knowledge with it and a really easy way to visualize data through Kibana. 

The simple setup (sure, there is only one node and in the real-world production ready case there should be much more work done around it) and the prior knowledge that this should be suffice to answer the wanted questions, and in over all this could make observability really nice and easy for any software eng to reason about.

### Visualization

1. Identify the wost blocking code:

```http://localhost:5601/app/kibana#/visualize/create?type=metric&indexPattern=6099a170-c746-11e9-845a-2745f940fbda&_g=()&_a=(filters:!(),linked:!f,query:(language:kuery,query:''),uiState:(),vis:(aggs:!((enabled:!t,id:'1',params:(field:blockedFor),schema:metric,type:max),(enabled:!t,id:'2',params:(field:blockCodeId,missingBucket:!f,missingBucketLabel:Missing,order:desc,orderBy:'1',otherBucket:!f,otherBucketLabel:Other,size:1),schema:group,type:terms)),params:(addLegend:!f,addTooltip:!t,dimensions:(bucket:(accessor:0,format:(id:terms,params:(id:string,missingBucketLabel:Missing,otherBucketLabel:Other)),type:vis_dimension),metrics:!((accessor:1,format:(id:number,params:()),type:vis_dimension))),metric:(colorSchema:'Green+to+Red',colorsRange:!((from:0,to:10000,type:range)),invertColors:!f,labels:(show:!t),metricColorMode:None,percentageMode:!f,style:(bgColor:!f,bgFill:%23000,fontSize:60,labelColor:!f,subText:''),useRanges:!f),type:metric),title:'',type:metric))```

3. Watch blocking events over time:

```http://localhost:5601/app/kibana#/visualize/create?type=metrics&_g=(refreshInterval:(pause:!t,value:0),time:(from:'2019-08-26T08:13:45.529Z',to:'2019-08-26T08:17:35.825Z'))&_a=(filters:!(),linked:!f,query:(language:kuery,query:''),uiState:(),vis:(aggs:!(),params:(axis_formatter:number,axis_position:left,axis_scale:normal,background_color_rules:!((id:'3747a170-c7da-11e9-b205-19a7d685b229')),bar_color_rules:!((id:'37e14960-c7da-11e9-b205-19a7d685b229')),default_index_pattern:'event-loop-metrics*',default_timefield:time,gauge_color_rules:!((id:'38846730-c7da-11e9-b205-19a7d685b229')),gauge_inner_width:10,gauge_style:half,gauge_width:10,id:'61ca57f0-469d-11e7-af02-69e470af7417',index_pattern:'',interval:'',series:!((axis_position:right,chart_type:line,color:%2368BC00,fill:0.5,formatter:number,id:'61ca57f1-469d-11e7-af02-69e470af7417',label:'',line_width:1,metrics:!((id:'61ca57f2-469d-11e7-af02-69e470af7417',type:count)),point_size:1,separate_axis:0,split_mode:terms,stacked:none,terms_field:blockCodeId,terms_include:'')),show_grid:1,show_legend:1,time_field:'',type:timeseries),title:'',type:metrics))```

This is for all blocking events, you can easily filter this using "Group by: Filter" with the KQL query string being, for example:  `blockCodeId : "waitAround:3:3" `

Example:
()

#### Place for improvment:

* Send to ES bulk of events (using count of events + deadline for send).
* Add the ability to identify JS library code (to answer 2).
* Metric for our service, maybe run it with Nsolid :)