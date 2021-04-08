const fs = require("fs");
const discord = require("discord.js");

const client = new discord.Client({ disableMentions: "everyone" });
const { Player } = require("discord-music-player");

client.player = new Player(client, {
  leaveOnEnd: true,
  leaveOnStop: true,
  leaveOnEmpty: false,
  timeout: 0,
  volume: 150,
  quality: "high",
});
client.config = require("./config/bot");
client.emotes = client.config.emojis;
client.filters = client.config.filters;
client.commands = new discord.Collection();

fs.readdirSync("./commands").forEach((dirs) => {
  const commands = fs
    .readdirSync(`./commands/${dirs}`)
    .filter((files) => files.endsWith(".js"));

  for (const file of commands) {
    const command = require(`./commands/${dirs}/${file}`);
    console.log(`Loading command ${file}`);
    client.commands.set(command.name.toLowerCase(), command);
  }
});

const events = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of events) {
  console.log(`Loading discord.js event ${file}`);
  const event = require(`./events/${file}`);
  client.on(file.split(".")[0], event.bind(null, client));
}

// Init the event listener only once (at the top of your code).
client.player
  // Emitted when channel was empty.
  .on("channelEmpty", (message, queue) =>
    message.channel.send(
      `The **${queue.connection.channel}** was empty, music was removed!`
    )
  )
  // Emitted when a song was added to the queue.
  .on("songAdd", (message, queue, song) =>
    message.channel.send(
      new discord.MessageEmbed()
        .setColor("#ff9a00")
        .setDescription(
          `<a:now:826450202935427123> **${song.name}** has been added to the queue!`
        )
        .setThumbnail(`${song.image}`)
    )
  )
  // Emitted when there was no more music to play.
  .on("queueEnd", (message, queue) =>
    message.channel.send(
      `<a:info:826458120095399957> The queue ended, nothing more to play!`
    )
  )
  // Emitted when a song changed.
  .on("songChanged", (message, newSong, oldSong) =>
    message.channel.send(
      new discord.MessageEmbed()
        .setColor("#ff9a00")
        .setTitle(` <a:info:826458120095399957> IS NOW PLAYING!`)
        .setDescription(`<a:loading:826449832034041945> **${newSong.name}**`)
        .setThumbnail(`${newSong.image}`)
    )
  )
  // Emitted when a first song in the queue started playing (after play method).
  .on("songFirst", (message, song) =>
    message.channel.send(
      new discord.MessageEmbed()
        .setColor("#ff9a00")
        .setTitle(` <a:info:826458120095399957> IS NOW PLAYING!`)
        .setDescription(`<a:loading:826449832034041945> **${song.name}**`)
        .setThumbnail(`${song.thumbnail}`)
    )
  )
  // Emitted when someone disconnected the bot from the channel.
  .on("clientDisconnect", (message, queue) =>
    message.channel.send(
      `<a:info:826458120095399957> I got disconnected from the channel, music was removed.`
    )
  )
  // Emitted when there was an error with NonAsync functions.
  .on("error", (message, error) => {
    switch (error) {
      // Thrown when the YouTube search could not find any song with that query.
      case "SearchIsNull":
        message.channel.send(
          `<a:info:826458120095399957> No song with that query was found.`
        );
        break;
      // Thrown when the provided YouTube Playlist could not be found.
      case "InvalidPlaylist":
        message.channel.send(
          `<a:info:826458120095399957> No Playlist was found with that link.`
        );
        break;
      // Thrown when the provided Spotify Song could not be found.
      case "InvalidSpotify":
        message.channel.send(
          `<a:info:826458120095399957> No Spotify Song was found with that link.`
        );
        break;
      // Thrown when the Guild Queue does not exist (no music is playing).
      case "QueueIsNull":
        message.channel.send(
          `<a:info:826458120095399957> There is no music playing right now.`
        );
        break;
      // Thrown when the Members is not in a VoiceChannel.
      case "VoiceChannelTypeInvalid":
        message.channel.send(
          `<a:info:826458120095399957> You need to be in a Voice Channel to play music.`
        );
        break;
      // Thrown when the current playing song was an live transmission (that is unsupported).
      case "LiveUnsupported":
        message.channel.send(
          `<a:info:826458120095399957> We do not support YouTube Livestreams.`
        );
        break;
      // Thrown when the current playing song was unavailable.
      case "VideoUnavailable":
        message.channel.send(
          `<a:info:826458120095399957> Something went wrong while playing the current song, skipping...`
        );
        break;
      // Thrown when provided argument was Not A Number.
      case "NotANumber":
        message.channel.send(
          `<a:info:826458120095399957> The provided argument was Not A Number.`
        );
        break;
      // Thrown when the first method argument was not a Discord Message object.
      case "MessageTypeInvalid":
        message.channel.send(
          `<a:info:826458120095399957> The Message object was not provided.`
        );
        break;
      // Thrown when the Guild Queue does not exist (no music is playing).
      default:
        message.channel.send(
          `<a:info:826458120095399957> **Unknown Error Ocurred:** ${error}`
        );
        break;
    }
  });

client.login(client.config.discord.token);
