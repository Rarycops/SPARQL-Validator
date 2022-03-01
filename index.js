const core =  require('@actions/core');
const github = require('@actions/github');
const { http, https } = require('follow-redirects');

async function main() {
    try {
        // take the input token for the action
        const owner = core.getInput('owner', { required: true });
        const repo = core.getInput('repo', { required: true });
        const pr_number = core.getInput('pr_number', { required: true });
        const token = core.getInput('token', { required: true });

        // Instance of Octokit to call the API
        const octokit = new github.getOctokit(token);
        
        // time of the action
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);

        const { data: changedFiles } = await octokit.rest.pulls.listFiles({
            owner,
            repo,
            pull_number: pr_number,
        });
        
        for (const file of changedFiles) {
            console.log(file)
            const file_extension = file.filename.split('.').pop();
            
            // if the file is a sparql file we start the validation
            if (file_extension == 'sparql')
            {
                const contents_url = file.raw_url;
                console.log(contents_url)
                const contents_request = await makeSynchronousRequest(contents_url);
                console.log(contents_request)
            }
        }
    }
    catch (error){
        core.setFailed(error.message);
    }
}

// function returns a Promise
function getPromise(url) {
	return new Promise((resolve, reject) => {
		https.get(url, (response) => {
            if (response.statusCode !== 200) {
                    console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
                    res.resume();
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
		let http_promise = getPromise(url);
		let response_body = await http_promise;

		return response_body;
	}
	catch(error) {
		console.log(error);
	}
}

main();