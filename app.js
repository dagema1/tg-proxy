'use strict'

const {MTProtoProxy} = require('./mtprotoproxy');
const http = require('http');
const net = require('net');
let ad_tag='cae554f8cbafba5b343a2d4f72e2f8e4'

let totalBytesRead=0;
let totalBytesWritten=0;
let totalConnections=0
let ongoingConnections=0
let stats=[];
let tracker=[];

let httpServer=http.createServer(function(req,res)
{
	res.write('<html><h1>Dear '+req.socket.remoteAddress+', Welcome; Here is the report:</h1>')
	res.end(`<h2>Statistics</h2><div>totalBytesRead: ${totalBytesRead}</div><div>totalBytesWritten: ${totalBytesWritten}</div><div>totalConnections: ${totalConnections}</div><div>ongoingConnections: ${ongoingConnections}</div><h2>Current clients:</h2><div>${Object.keys(stats).map(address=>`${address}:${stats[address]}`).join('</div><div>')}</div></html>`);
});


let telegram=new MTProtoProxy({
secrets:['dd00000000000000000000000000000000','ee00000000000000000000000000000000'],
httpServer,
async enter(options)
{
	tracker[options.id]=options;
	console.log('New client:',options);
	ongoingConnections++;
	if (stats[options.address])
		stats[options.address]++;
	else
		stats[options.address]=1;
	if (options.address==='8.8.8.8')
		return Promise.reject(new Error('Forbidden conuntry'));  //or simply throw error
	return ad_tag;
},
leave(options)
{
	console.log('Client left:',options);
	totalBytesRead+=options.bytesRead;
	totalBytesWritten+=options.bytesWritten;
	stats[tracker[options.id].address]--;
	if (stats[tracker[options.id].address]===0)
		delete stats[tracker[options.id].address];
	totalConnections++;
	ongoingConnections--;
	delete tracker[options.id]
},
ready()
{
	console.log('ready')
	let proxy=net.createServer(telegram.proxy);
	proxy.on('error',function(err){console.log(err)})
	proxy.listen(3001,'0.0.0.0');
}
});