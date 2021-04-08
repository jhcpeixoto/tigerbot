module.exports = async (client) => {
  console.log(
    `Logged in as ${client.user.username}. Ready on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users`
  );
  setInterval(() => {
    client.user
      .setPresence({
        game: {
          name: client.guilds.cache.size + " servers using!",
          type: "WATCHING",
        },
        status: "online",
      })
      .then(console.log)
      .catch(console.error);
  }, 1000 * 60 * 5);
};
