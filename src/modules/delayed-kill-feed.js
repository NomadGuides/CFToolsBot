const { serverConfig } = require('./cftClient');
const { isValidWebhookConfigMessage } = require('./webhooks');

const checkIsDelayedKillFeedMsg = async (msg) => {
  const {
    channelId,
    webhookId,
    author,
    cleanContent
  } = msg;
  for await (const cfg of serverConfig) {
    const {
      USE_KILL_FEED,
      KILL_FEED_DELAY,
      KILL_FEED_CHANNEL_ID,
      CFTOOLS_WEBHOOK_CHANNEL_ID,
      CFTOOLS_WEBHOOK_USER_ID,
      KILL_FEED_MESSAGE_IDENTIFIER,
      KILL_FEED_REMOVE_IDENTIFIER
    } = cfg;
    const isKillMsg = cleanContent.indexOf(
      KILL_FEED_MESSAGE_IDENTIFIER
      ?? ' got killed by '
    ) >= 0;
    if (!isKillMsg) continue;

    const isTargetChannel = channelId === CFTOOLS_WEBHOOK_CHANNEL_ID;
    const isTargetUser = CFTOOLS_WEBHOOK_USER_ID === (
      process.env.NODE_ENV === 'production'
        ? webhookId
        : author.id
    );

    // Validate target ids/is webhook message
    if (!USE_KILL_FEED || !isTargetChannel || !isTargetUser) continue;

    // Resolve target channel
    const webhookTargetChannel = isValidWebhookConfigMessage(msg, KILL_FEED_CHANNEL_ID);
    if (!webhookTargetChannel) continue;

    // Send the notification
    await new Promise((resolve) => {
      setTimeout(async () => {
        const feedMsg = await webhookTargetChannel.send(
          KILL_FEED_REMOVE_IDENTIFIER
            ? cleanContent.replaceAll(KILL_FEED_MESSAGE_IDENTIFIER, '')
            : cleanContent
        );
        resolve(feedMsg);
      }, KILL_FEED_DELAY * 1000);
    });
  }
};

module.exports = { checkIsDelayedKillFeedMsg };
