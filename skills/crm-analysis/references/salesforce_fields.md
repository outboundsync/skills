# Salesforce fields created/updated by OutboundSync

Source: OutboundSync canonical field definitions (mirrors `outboundsync.com/docs` — Salesforce custom fields). OutboundSync creates these custom fields on **Lead** and **Contact**.

> **Note:** The Salesforce field set spans **email, social, and common** engagement signals — it is **not** email-only. Social fields (connection status, social messages, follows, likes, views) populate for connections whose engagement platform sends social activity (e.g. HeyReach); email fields populate for email platforms (e.g. Smartlead, Instantly); common fields apply to any channel. Which fields are populated depends on the connected platform and the channels in use — treat an empty field as **"not synced for this record,"** not "the event did not happen." Salesforce API names never contain spaces.

## Common fields (7)

Apply to any channel.

| Field Label | API Name | Data Type | Description |
|---|---|---|---|
| Last update occurred | `OSLastUpdateOccurred__c` | Date/Time | When OutboundSync last updated any of these custom fields on this record. |
| Last update source | `OSLastUpdateSource__c` | Text(255) | The source system (e.g., Smartlead, Instantly) that triggered the last update. |
| Last campaign name | `OSLastCampaignName__c` | Text(255) | The name of the most recent outbound campaign associated with this record (any channel). |
| Last campaign ID | `OSLastCampaignId__c` | Text(255) | The unique ID of the most recent campaign associated with this record. |
| Last lead category name | `OSLastLeadCategoryName__c` | Text(255) | The name of the last lead category (e.g., Interested, Not a Fit, Unsubscribed). |
| Last lead category ID | `OSLastLeadCategoryId__c` | Text(255) | The internal ID of the last lead category assigned. |
| Last app URL | `OSLastAppUrl__c` | Text(255) | The URL of the outbound app or sequence that last updated this record. |

## Email fields (24)

Populate for email engagement platforms.

| Field Label | API Name | Data Type | Description |
|---|---|---|---|
| Last email sent time | `OSLastSentTime__c` | Date/Time | Timestamp of the last email sent to this record. |
| Last email sent address | `OSLastSentAddress__c` | Text(255) | The email address used to send the last outbound email. |
| Last email sent subject | `OSLastSentSubject__c` | Text(255) | The subject of the last email sent. |
| Last email sent name | `OSLastSentName__c` | Text(255) | The sender name for the last sent email. |
| Last email sent message | `OSLastSentMessage__c` | Long Text Area(32000) | The body content of the last email sent. |
| Last email open time | `OSLastOpenTime__c` | Date/Time | Timestamp of the most recent email open. |
| Last email open subject | `OSLastOpenSubject__c` | Text(255) | The subject line of the most recently opened email. |
| Last email open message | `OSLastOpenMessage__c` | Long Text Area(32000) | The body of the most recently opened email. |
| Last link click time | `OSLastLinkClickTime__c` | Date/Time | Timestamp of the most recent link click from an outbound email. |
| Last link click URL | `OSLastLinkClickURL__c` | Text(255) | The URL most recently clicked by the lead or contact. |
| Last email reply time | `OSLastReplyTime__c` | Date/Time | Timestamp of the most recent reply received. |
| Last email reply address | `OSLastReplyAddress__c` | Text(255) | The email address that sent the last reply. |
| Last email reply name | `OSLastReplyName__c` | Text(255) | The sender name of the last reply. |
| Last email reply subject | `OSLastReplySubject__c` | Text(255) | The subject of the last reply received. |
| Last email reply message | `OSLastReplyMessage__c` | Long Text Area(32000) | The content of the most recent reply received. |
| Last email bounce time | `OSLastBounceTime__c` | Date/Time | The time the last email to this record bounced. |
| Last email unsubscribe time | `OSLastUnsubscribeTime__c` | Date/Time | The time this record unsubscribed from outbound messaging. |
| Last email campaign name | `OSLastEmailCampaignName__c` | Text(255) | The name of the most recent email campaign for this record. |
| Last email campaign ID | `OSLastEmailCampaignId__c` | Text(255) | The unique ID of the most recent email campaign. |
| Last email lead category update ID | `OSLastEmailLeadCategoryId__c` | Text(255) | The internal ID of the last lead category set by an email event. |
| Last email lead category update name | `OSLastEmailLeadCategoryName__c` | Text(255) | The name of the last lead category set by an email event. |
| Last email sequence step | `OSLastEmailSequenceStep__c` | Number | The sequence step number of the last email sent. |
| Number of email opens | `OSNumberOfEmailOpens__c` | Number | Count of email opens recorded for this record. |
| Number of email link clicks | `OSNumberOfEmailLinkClicks__c` | Number | Count of email link clicks recorded for this record. |

## Social fields (28)

Populate for social engagement platforms (e.g. HeyReach). Absent for email-only connections.

| Field Label | API Name | Data Type | Description |
|---|---|---|---|
| Last social profile URL | `OSLastSocialProfileUrl__c` | Text(255) | The lead's social profile URL for the last social event. |
| Last social sender profile URL | `OSLastSocialSenderProfileUrl__c` | Text(255) | The sender's social profile URL for the last social event. |
| Last social message type | `OSLastSocialMessageType__c` | Text(50) | The type of the last social message. |
| Last social message text | `OSLastSocialMessageText__c` | Long Text Area(32000) | The text of the last social message. |
| Last social activity time | `OSLastSocialActivityTime__c` | Date/Time | Timestamp of the most recent social activity. |
| Last social activity type | `OSLastSocialActivityType__c` | Text(100) | The type of the most recent social activity. |
| Last social post URL | `OSLastSocialPostUrl__c` | Text(255) | The URL of the social post for the last relevant event. |
| Last social campaign name | `OSLastSocialCampaignName__c` | Text(255) | The name of the most recent social campaign. |
| Last social campaign ID | `OSLastSocialCampaignId__c` | Text(255) | The unique ID of the most recent social campaign. |
| Last connection status | `OSLastConnectionStatus__c` | Text(255) | The most recent social connection status. |
| Last connection status time | `OSLastConnectionStatusTime__c` | Date/Time | Timestamp of the most recent connection status change. |
| Last sent social message | `OSLastSentSocialMessage__c` | Long Text Area(32000) | The text of the last social message sent. |
| Last sent social profile | `OSLastSentSocialProfile__c` | Text(255) | The profile of the last social message sent. |
| Last sent social sender | `OSLastSentSocialSender__c` | Text(255) | The sender of the last social message sent. |
| Last sent social time | `OSLastSentSocialTime__c` | Date/Time | Timestamp of the last social message sent. |
| Last reply social message | `OSLastReplySocialMessage__c` | Long Text Area(32000) | The text of the last social reply received. |
| Last reply social profile | `OSLastReplySocialProfile__c` | Text(255) | The profile of the last social reply received. |
| Last reply social sender | `OSLastReplySocialSender__c` | Text(255) | The sender of the last social reply received. |
| Last reply social time | `OSLastReplySocialTime__c` | Date/Time | Timestamp of the last social reply received. |
| Last follow sender | `OSLastFollowSender__c` | Text(255) | The sender of the last follow action. |
| Last follow time | `OSLastFollowTime__c` | Date/Time | Timestamp of the last follow action. |
| Last like sender | `OSLastLikeSender__c` | Text(255) | The sender of the last like action. |
| Last like time | `OSLastLikeTime__c` | Date/Time | Timestamp of the last like action. |
| Last like post URL | `OSLastLikePostUrl__c` | Text(255) | The URL of the post for the last like action. |
| Last view sender | `OSLastViewSender__c` | Text(255) | The sender of the last profile view. |
| Last view time | `OSLastViewTime__c` | Date/Time | Timestamp of the last profile view. |
| Last social lead category ID | `OSLastSocialLeadCategoryId__c` | Text(255) | The internal ID of the last lead category set by a social event. |
| Last social lead category name | `OSLastSocialLeadCategoryName__c` | Text(255) | The name of the last lead category set by a social event. |
