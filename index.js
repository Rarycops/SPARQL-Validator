const core =  require('@actions/core');
const github = require('@actions/github');

function main(){
    try {
        // take the input to the action
        const file = core.getInput('file');
        
        // time of the action
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);

        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
        console.log(`The event payload: ${payload}`);

    }
    catch (error){
        core.setFailed(error.message);
    }
}

main();