const core =  require('@actions/core');
const github = require('@actions/github');

function main(){
    try {
        // take the input to the action
        const file = core.getInput('file');
        
        // check if the file is a .sparql file
        for (const file of changedFiles) {
            // get the exteension of the file
            const fileExtension = file.filename.split('.').pop();

            if (fileExtension == 'sparql'){

            }
        }
    }
    catch (error){
        core.setFailed(error.message);
    }
}

main();