const core =  require('@actions/core');
const github = require('@actions/github');

function main(){
    try {
        // take the input to the action
        const file = core.getInput('file');
        
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);

        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
        console.log(`The event payload: ${payload}`);

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
    }
    catch (error){
        core.setFailed(error.message);
    }
}

main();