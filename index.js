const core =  require('@actions/core');
const github = require('@actions/github');

const main = async () =>{
    try {
        // take the input to the action
        const file = core.getInput('file');
        
        // time of the action
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);

        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
        console.log(`The event payload: ${payload}`);

        // Creating an instance of Octokit
        const octokit = new github.getOctokit(token);

        // fetch the list of files that have been changed
        const { data: changedFiles } = await octokit.rest.pulls.listFiles({
            owner,
            repo,
            pull_number: pr_number,
        });

        // check if the file is a .sparql file
        for (const file of changedFiles) {
            // get the exteension of the file
            const fileExtension = file.filename.split('.').pop();

            if (fileExtension == 'sparql'){
                console.log(file.filename);
            }
            else{
                console.log(file.filename, " is not a .sparql file");
            }
        }
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

main();