import joplin from 'api';
import { ContentScriptType, SettingItemType } from 'api/types';
//add the consts for the settings
const StandardNotebookId = 'standard-notebook-id';
const imapServer = 'standard-imap-server';
const MailAddress = 'standard-mail-address';
const MailPassword = 'standard-mail-password';
const MailPort = 'standard-mail-port';
const MailTLS = '';
const stringSubject = 'standard-subject';


//email connection
const Imap = require('imap');
const {simpleParser} = require('mailparser');

//Settings
const registerSettings = async () => {
    const sectionName = 'mail-to-notebook-plugin';
    await joplin.settings.registerSection(sectionName, {
        label: 'Mail to Note plugin',
        description: 'Settings for the Mail to Note plugin.',
        iconName: 'fas fa-edit',
    });

    await joplin.settings.registerSettings({
        [stringSubject]: {
            section: sectionName,
            value: "", // Default value
            public: true, // Show in the settings screen
            type: SettingItemType.String,
            label: 'The String, the subject should start with',
        },
        [StandardNotebookId]: {
            section: sectionName,
            value: "", // Default value
            public: true, // Show in the settings screen
            type: SettingItemType.String,
            label: 'Name of the Notebook, the Mails should be saved in (Name must be unique)',
        },
        [imapServer]: {
            section: sectionName,
            value: "", // Default value
            public: true, // Show in the settings screen
            type: SettingItemType.String,
            label: 'Imap Webserver',
        },
        [MailAddress]: {
            section: sectionName,
            value: "", // Default value
            public: true, // Show in the settings screen
            type: SettingItemType.String,
            label: 'Mail Address',
        },
        [MailPassword]: {
            section: sectionName,
            value: "", // Default value
            public: true, // Show in the settings screen
            type: SettingItemType.String,
            label: 'Mail Password',
        },
        [MailPort]: {
            section: sectionName,
            value: "993", // Default value
            public: true, // Show in the settings screen
            type: SettingItemType.Int,
            label: 'Mail Port',
        },
        [MailTLS]: {
            section: sectionName,
            value: true, // Default value
            public: true, // Show in the settings screen
            type: SettingItemType.Bool,
            label: 'Use TLS',
        },
    });
};

// Register the plugin
joplin.plugins.register({

     onStart: async function() {
            //settings
        await registerSettings();
            // get Infos from Settings
            const SetMailAddress = await joplin.settings.value(MailAddress);
            const SetMailPassword = await joplin.settings.value(MailPassword);
            const SetMailPort= await joplin.settings.value(MailPort);
            const SetimapServer = await joplin.settings.value(imapServer);
            const SetTLS = await joplin.settings.value(MailTLS);
            const SetstringSubject = await joplin.settings.value(stringSubject);
            const imapConfig = {
                user: SetMailAddress,
                password: SetMailPassword,
                host: SetimapServer,
                port: SetMailPort,
                tls: SetTLS,
            };
            //get the Notebookname from the settings
            const settingValue = await joplin.settings.value(StandardNotebookId);
            //get all notebooks
            let notebook = await joplin.data.get(['folders']);
            var notebookID = "";

            //parse through notebooks and get the id of the necessary notebook
            if(settingValue != "")
            {
                notebook.items.forEach(function(book){
                    if(book.title == settingValue)
                    {
                        notebookID = book.id;
                    }

                });

                if(SetMailAddress != "" &&SetMailPassword != "" &&SetMailPort != "" &&SetimapServer != "" &&SetstringSubject != "" &&SetTLS != "")
                {
                    getEmails(notebookID, imapConfig, SetstringSubject);
                }
                else {
                    let newnote = await joplin.data.post(['notes'], null, {body: "One or more of the Fields of the Setup are empty", title: "EROOR!", parent_id: notebookID });
                }
            }
            else{
                let newnote = await joplin.data.post(['notes'], null, {body: "Notebook is missing in the Settings", title: "EROOR!", parent_id: notebookID });
            }
     },

 });

// From https://stackoverflow.com/a/6234804/561309
function escapeHtml(unsafe:string) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


//get emails
const getEmails = (notebookID, imapConfig1, neededSubject) => {
  try {
    const imap = new Imap(imapConfig1);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['UNSEEN', ['SINCE', new Date()]], (err, results) => {
          const f = imap.fetch(results, {bodies: ''});
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, parsed) => {
                // const {from, subject, textAsHtml, text} = parsed;
                if(parsed.subject.includes(neededSubject))
                {
                    const subj = parsed.subject.replace(neededSubject, "");
                    //write into notebook
                    let newnote = await joplin.data.post(['notes'], null, {body: escapeHtml(parsed.text), title: escapeHtml(subj), parent_id: notebookID });
                }
                /* Make API call to save the data
                   Save the retrieved data into a database.
                   E.t.c
                */
              });
            });
            msg.once('attributes', attrs => {
              const {uid} = attrs;
              imap.addFlags(uid, ['\\Seen'], () => {
                // Mark the email as read after reading it
              });
            });
          });
          f.once('error', ex => {
           let newnote = joplin.data.post(['notes'], null, {body: ex, title: "Error", parent_id: notebookID });
            return Promise.reject(ex);
          });
          f.once('end', () => {
            imap.end();
          });
        });
      });
    });

    imap.once('error', err => {
    let newnote = joplin.data.post(['notes'], null, {body: err, title: "Error", parent_id: notebookID });
    });

    imap.once('end', () => {
    });

    imap.connect();
  } catch (ex) {
  let newnote = joplin.data.post(['notes'], null, {body: "an error occurred", title: "Error", parent_id: notebookID });
  }
};