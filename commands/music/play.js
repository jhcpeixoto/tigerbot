const isUrl = (string) => {
  try {
    return Boolean(new URL(string));
  } catch (e) {
    return false;
  }
};

module.exports = {
  name: "play",
  aliases: ["p"],
  category: "Music",
  utilisation: "{prefix}play [name/URL]",

  async execute(client, message, args) {
    if (!message.member.voice.channel)
      return message.channel.send(
        `<a:info:826458120095399957> ${client.emotes.error} - You're not in a voice channel !`
      );

    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return message.channel.send(
        `<a:info:826458120095399957> ${client.emotes.error} - You are not in the same voice channel !`
      );

    if (!args[0])
      return message.channel.send(
        `<a:info:826458120095399957> ${client.emotes.error} - Please indicate the title of a song !`
      );

    let queue = client.player.getQueue(message);
    if (!(queue != undefined)) {
      if (!isUrl(args[0])) {
        await client.player.play(message, args.join(" "));
      } else {
        if (args[0].includes("playlist")) {
          await client.player.playlist(message, {
            search: args[0],
            maxSongs: -1,
          });
        } else {
          await client.player.play(message, args.join(" "));
        }
      }
    } else {
      if (args[0].includes("playlist")) {
        await client.player.playlist(message, {
          search: args[0],
          maxSongs: -1,
        });
      } else {
        await client.player.addToQueue(message, args.join(" "));
      }
    }
  },
};
