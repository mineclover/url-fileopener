import { handleWrapperScript } from './wrapperScript.js';

const preProcessCommands = async (protocol, command) => {
    const newCommand = await handleWrapperScript(protocol, command);
    return newCommand;
};
export {
    preProcessCommands
};
