exports.twitterConfig = {
	consumer_key: 'XXXXXXXXXXXXXXXXXXXXXX',
	consumer_secret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
	access_token_key: 'XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
	access_token_secret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
}
exports.twumConfig = {
	consumer_key: exports.twitterConfig.consumer_key,
	consumer_secret: exports.twitterConfig.consumer_secret,
	token: exports.twitterConfig.access_token_key,
	token_secret: exports.twitterConfig.access_token_secret
}