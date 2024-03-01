# Joplin Mail Plugin
## Overview
Get all the E-Mails, that get sent to a specific E-Mail Address made into Notes.

## Setting Options
| Field Name                                                               | Information                                                                                                                                             | Required |
|--------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| The String, the subject should start with                                | Add this string to your emails when forwarding/sending them to your Notes mail Address. If you dont want a special string type `[empty]` into the field | yes      |
| Name of the Notebook, the Mails should be saved in (Name must be unique) | The name of the Notebook where you like to save your Mails this must be **unique**                                                                      | yes      |
| Imap Webserver                                                           | the imap Address of your email Address                                                                                                                  | yes      |
| Mail Address                                                             | Your Mail Address you like to get the Mails from                                                                                                        | yes      |
| Mail Password                                                            | The Password for your Mail Adrress                                                                                                                      | yes      |
| Mail Port                                                                | The Port of the Imap Server (the standard is 993)                                                                                                       | yes      |
| Use TLS                                                                  | Select if you Imap Server uses TLS                                                                                                                      | yes      |

## How to Install
- Go to `Tools>Options>Plugins` and search for `MailPlugin` and add it to your installation.
- Download the latest release. Go in Joplin to `Tools>Options>Plugins` click on the Cog Wheel and Install from File. Browse for the downloaded file and add it.

## Disclaimer
I have no Idea, how safe your data is saved within the Joplin Databases, so I would suggest creating a E-Mail Address just for this purpose (for example on gmail) and delete the E-Mails periodically, so that if the password gets leaked, its not that big of a deal.
## Known Issues
- The Mail Parser doesn't find the text of some mails
## Planned for coming releases
- [x] Add Date and Time to Error Messages
- [ ] Also Add E-Mail Attachments to Notes
- [x] Make a more Secure Input Validation
- [x] Add it to the Joplin Plugin Store