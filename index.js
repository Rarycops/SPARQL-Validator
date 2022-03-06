const core =  require('@actions/core');
const github = require('@actions/github');
const { http, https } = require('follow-redirects');
const url = require('url');

async function main() {
    try {
        // take the input token for the action
        const owner = core.getInput('owner', { required: true });
        const repo = core.getInput('repo', { required: true });
        const pr_number = core.getInput('pr_number', { required: true });
        const token = core.getInput('token', { required: true });
        let default_graph_uri = core.getInput('default_graph_uri', { required: false });

        if (typeof default_graph_uri !== 'undefined') {
            default_graph_uri = `http://dbpedia.org`;
        }

        // Instance of Octokit to call the API
        const octokit = new github.getOctokit(token);

        const { data: changedFiles } = await octokit.rest.pulls.listFiles({
            owner,
            repo,
            pull_number: pr_number,
        });

		let response = '';
		let error = false;

        for (const file of changedFiles) {
            const file_extension = file.filename.split('.').pop();

			response = response + '\n# The file with name: ' + file.filename + '\n---\n'

            // if the file is a sparql file we start the validation
            if (file_extension == 'sparql')
            {
                const contents_url = file.raw_url;
                const contents_request = await makeSynchronousRequest(contents_url);
				const llamada = await makeSynchronousqueryRequest(default_graph_uri, contents_request);
				const array_res = llamada.toString().split(" ");
				 if (array_res[2] == 'Error')
                {
					error = true;
				}
                // Validation of de file
                response = response + '## ' + llamada + '\n---\n';
            }
        }

		await octokit.rest.issues.createComment({
			owner,
			repo,
			issue_number: pr_number,
			body: `` + response + ``
    	});

		if(error){
			core.setFailed(response);
		}

		core.setOutput('results', response)

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
function get_query(default_graph_uri, query) {
	const requestUrl = url.parse(url.format({
										protocol: 'https',
										hostname: 'dbpedia.org',
										pathname: '/sparql',
										query: {
											'default-graph-uri': default_graph_uri,
											query: query
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
async function makeSynchronousqueryRequest(default_graph_uri, query) {
	try {
		let http_promise = get_query(default_graph_uri, query);
		let response_body = await http_promise;

		return response_body;
	}
	catch(error) {
		console.log(error);
	}
}

main();