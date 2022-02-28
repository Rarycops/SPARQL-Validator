const core =  require('@actions/core');
const github = require('@actions/github');
const https = require('https');

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

        // To get the data that is different
        let diffData = {
            additions: 0,
            deletions: 0,
            changes: 0
        };

        // Sum of all the additions, deletions and changes
        diffData = changedFiles.reduce((acc, file) => {
            acc.additions += file.additions;
            acc.deletions += file.deletions;
            acc.changes += file.changes;
            return acc;
        }, diffData);
        
        for (const file of changedFiles) {
            const file_extension = file.filename.split('.').pop();
            const file_url = file.raw_url;
            console.log(file_url)
            const request = https.get(file_url, (res) => {
                if (res.statusCode !== 200) {
                    console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
                    res.resume();
                    return;
                }
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('close', () => {
                    console.log('Retrieved all data');
                    console.log(data);
                });
                
                request.on('error', (err) => {
                console.error(`Encountered an error trying to make a request: ${err.message}`);
                });
            });
        }

        // Creates a comment on the PR with the information compiled 
        await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: pr_number,
            body: `
                Pull Request #${pr_number} has been updated with: \n
                - ${diffData.changes} changes \n
                - ${diffData.additions} additions \n
                - ${diffData.deletions} deletions \n
            `
        });

    }
    catch (error){
        core.setFailed(error.message);
    }
}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

main();