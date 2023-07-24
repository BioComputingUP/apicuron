const StreamArray = require('stream-json/streamers/StreamArray');
const StreamObject = require('stream-json/streamers/StreamObject');
const { pick } = require('stream-json/filters/Pick');
const { filter } = require('stream-json/filters/Filter');
const { parser } = require('stream-json');
const fs = require('fs');
const { Observable, take } = require('rxjs');

async function main() {
	const jsonStream = new StreamObject();
	const mainStream = fs
		.createReadStream('file.json')
		.pipe(parser())
		.pipe(filter({ filter: /^(?!reports).*$/ }))
		.pipe(jsonStream);

	// mainStream.on('data', (data) => {
	//     console.log("main", data)
	// })

	const defaultObj = await new Promise((resolve, reject) => {
		const defaultReport = {};
		mainStream.on('data', ({ key, value }) => {
			defaultReport[key] = value;
		});

		mainStream.on('end', () => {
			resolve(defaultReport);
		});
	});

    console.log('defaults', defaultObj)

	// defaultsPromise.then((thing) => {
	// 	console.log('defaults, ', thing);
	// });

	// internal Node readable stream option, pipe to stream-json to convert it for us
	const pipeline = fs.createReadStream('file.json').pipe(parser());

	const reportsPipeline = pipeline.pipe(pick({ filter: 'reports' }));
	// const defaultsPipeline = pipeline.pipe(ignore({filter: /^\d+\.reports\b/ }));

	const reportsStream = reportsPipeline.pipe(new StreamArray());
	// const defaultsStream = defaultsPipeline.pipe(new StreamObject());

	//You'll get json objects here
	//Key is the array-index here

	const reports$ = new Observable((observer) => {
		reportsStream.on('data', (data) => {
			// console.log('reports', data);
			observer.next(data);
		});

		reportsStream.on('end', (data) => {
			observer.complete();
			// console.log('All Done', data);
		});
	});

    reports$.pipe(take(1)).subscribe((data) => {
		console.log(data);
	});
}

main();
// reportsStream.on('data', (data) => {
//     console.log('reports', data);
// });

// reportsStream.on('end', (data) => {
//     console.log('All Done', data);
// });
