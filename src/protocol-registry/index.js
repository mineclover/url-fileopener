import fs from 'fs';
import constants from './config/constants.js';
import linux from './linux/index.js';
import macos from './macos/index.js';
import windows from './windows/index.js';
import {
    registryValidator,
    protocolValidator,
    deRegistryValidator
} from './utils/validator.js';
import { checkIfFolderExists } from './utils/fileUtil.js';
import { preProcessCommands } from './utils/processCommand.js';

const { homedir } = constants;

const getPlatform = () => {
    if (process.platform === constants.platforms.windows) return windows;
    if (process.platform === constants.platforms.linux) return linux;
    if (process.platform === constants.platforms.macos) return macos;
    throw new Error('Unknown OS');
};

const platform = getPlatform();

/**
 * Registers the given protocol with the given command.
 * @param {string=} protocol - Protocol on which it the given command should be called.
 * @param {string=} command - Command which will be executed when the above protocol is initiated
 * @param {object} options - the options
 * @param {boolean=} options.override - Command which will be executed when the above protocol is initiated
 * @param {boolean=} options.terminal - If set true then your command will open in new terminal
 * @param {string=} options.appName - Name of the app by default it will be `url-${protocol}`
 * @returns {Promise}
 */
const register = async (protocol, command, options = {}) => {
    const validatedOptions = registryValidator(protocol, command, options);

    if (!fs.existsSync(homedir)) {
        fs.mkdirSync(homedir);
    }

    if (!validatedOptions.appName) {
        validatedOptions.appName = `url-${validatedOptions.protocol}`;
    }

    const defaultApp = await platform.getDefaultApp(validatedOptions.protocol);

    if (defaultApp) {
        if (!validatedOptions.override)
            throw new Error('Protocol already exists');
        await platform.deRegister({
            protocol: validatedOptions.protocol,
            force: false,
            defaultApp
        });
    }

    validatedOptions.command = await preProcessCommands(
        validatedOptions.protocol,
        validatedOptions.command
    );

    return platform.register(validatedOptions);
};

/**
 * Checks if the given protocol already exist on not
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const checkIfExists = async (protocol) => {
    return (await platform.getDefaultApp(protocolValidator(protocol))) !== null;
};

/**
 * Fetches the default app for the given protocol
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const getDefaultApp = async (protocol) => {
    return platform.getDefaultApp(protocolValidator(protocol));
};

/**
 * Removes the registration of the given protocol
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @param {object} [options={}] - the options
 * @param {boolean=} options.force - This option has no effect in windows
 * @returns {Promise}
 */
const deRegister = async (protocol, options = {}) => {
    const validatedOptions = deRegistryValidator(protocol, options);

    const defaultApp = await platform.getDefaultApp(validatedOptions.protocol);
    validatedOptions.defaultApp = defaultApp;

    if (!defaultApp) return;

    await platform.deRegister(validatedOptions);

    try {
        if (
            checkIfFolderExists(homedir) &&
            fs.readdirSync(homedir).length === 0
        ) {
            fs.rmSync(homedir, { recursive: true, force: true });
        }
    } catch (e) {
        console.debug(
            `Ignoring Error for deleting empty directory : ${homedir}`,
            e
        );
    }
};

export {
    register,
    checkIfExists,
    getDefaultApp,
    deRegister
};
