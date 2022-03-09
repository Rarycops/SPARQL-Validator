const core =  require('@actions/core');
const github = require('@actions/github');
const { http, https } = require('follow-redirects');
const url = require('url');
const fs = require('fs');

async function main() {
    try {
        // take the input token for the action
        const owner = core.getInput('owner', { required: true });
        const repo = core.getInput('repo', { required: true });
        const pr_number = core.getInput('pr_number', { required: true });
        const token = core.getInput('token', { required: true });
		const actor = core.getInput('actor', { required: true });
        const graph_uri = core.getInput('graph_uri', { required: false });
		const format = core.getInput('format', { required: false });
		let path = core.getInput('path', { required: false });
		
		if (!path)
			path = 'SPARQL-Validator';

		let output_format;
		switch (format) {
			case 'application/json':
				output_format = '.json';
				break;
			case 'application/javascript':
				output_format = '.js';
				break;
			case 'application/turtle':
				output_format = '.ttl';
				break;
			case 'text/plain':
				output_format = '.txt';
				break;
			default:
				output_format = '.html';
		}

        // Instance of Octokit to call the API
        const octokit = new github.getOctokit(token);

        const { data: changedFiles } = await octokit.rest.pulls.listFiles({
            owner,
            repo,
            pull_number: pr_number,
        });

		let response = '';
		let err = false;
        let files = false;

		// Creting the folther for the files
		fs.mkdirSync('./SPARQL-Validator/' + actor, { recursive: true })

        for (const file of changedFiles) {
            const file_extension = file.filename.split('.');

			console.log(file_extension[0])
			console.log(file_extension[1])

            // if the file is a sparql file we start the validation
            if (file_extension[1] == 'sparql'){
                files = true;
                const contents_url = file.raw_url;
                const contents_request = await makeSynchronousRequest(contents_url);
				const llamada = await makeSynchronousqueryRequest(graph_uri, contents_request, format);
				const array_res = llamada.toString().split(" ");
				
				if (array_res[2] == 'Error'){
					response = response + '# The file with name: ' + file.filename + '\n---\n' + '```\n ' + llamada + ' \n```\n\n';
					err = true;
				}
				else{
					//Creating the file
					fs.writeFile('./' + path + '/' + actor + '/' + file_extension[0] + output_format, llamada, err => {
						if (err) {
							core.setFailed(error.message);
						}
					})
				}
            }
        }

        if (files && err){
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: pr_number,
                body:  response 
            });
            core.setFailed(response);
            
        }

    }
    catch (error){
        core.setFailed(error.message);
    }
}

// function returns a Promise
function get_promise(url) {
	return new Promise((resolve, reject) => {
		https.get(url, (response) => {
            if (response.statusCode !== 200) {
                    core.setFailed(`Did not get an OK from the server. Code: ${response.statusCode}, from petition to: \n`, url);
                    response.resume();
                    return;
            }
            
			let chunks_of_data = [];

			response.on('data', (fragments) => {
				chunks_of_data.push(fragments);
			});

			response.on('end', () => {
				let response_body = Buffer.concat(chunks_of_data);
				resolve(response_body.toString());
			});

			response.on('error', (error) => {
				reject(error);
			});
		});
	});
}

// function returns a Promise with a query from dBpedia
function get_query(graph_uri, query, format) {
	const requestUrl = url.parse(url.format({
										protocol: 'https',
										hostname: 'dbpedia.org',
										pathname: '/sparql',
										query: {
											'default-graph-uri': graph_uri,
											query: query,
											format: format
										}
									}));

	return new Promise((resolve, reject) => {
		https.get({hostname: requestUrl.hostname,path: requestUrl.path,}, (response) => {
            if (response.statusCode !== 200 && response.statusCode !== 400) {
                    core.setFailed(`Did not get an OK from the server. Code: ${response.statusCode}, from query: \n` + query);
                    response.resume();
                    return;
            }
            
			let chunks_of_data = [];

			response.on('data', (fragments) => {
				chunks_of_data.push(fragments);
			});

			response.on('end', () => {
				let response_body = Buffer.concat(chunks_of_data);
				resolve(response_body.toString());
			});

			response.on('error', (error) => {
				reject(error);
			});
		});
	});
}

// async function to make http request
async function makeSynchronousRequest(url) {
	try {
		let http_promise = get_promise(url);
		let response_body = await http_promise;

		return response_body;
	}
	catch(error) {
		console.log(error);
	}
}

// async function to make http query request
async function makeSynchronousqueryRequest(graph_uri, query, format) {
	try {
		let http_promise = get_query(graph_uri, query, format);
		let response_body = await http_promise;

		return response_body;
	}
	catch(error) {
		console.log(error);
	}
}

main();