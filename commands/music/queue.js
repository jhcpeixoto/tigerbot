const Discord = require("discord.js");

module.exports = {
  name: "queue",
  aliases: [],
  category: "Music",
  utilisation: "{prefix}queue",

  async execute(client, message) {
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

    const queue = client.player.getQueue(message);

    if (!queue)
      return message.channel.send(
        `<a:info:826458120095399957> ${client.emotes.error} - No songs currently playing !`
      );

    // Now, we need some content to actually post so we'll create an ARRAY with our pages.
    let nowListen = "<a:now:826450202935427123>";
    let number = [
      "<:1_:826450202616397866>",
      "<:2_:826450202646151179>",
      "<:3_:826450202805665792>",
      "<:4_:826450202905804870>",
      "<:5_:826450202721648692>",
      "<:6_:826450202826113034>",
      "<:7_:826450202906198067>",
      "<:8_:826450202759921696>",
      "<:9_:826450202717978676>",
    ];
    let n = 0;
    let tempPages = [];
    let pages = [];
    const rowLen = queue.songs.length;
    tempPages = [
      queue.songs.map((song, i) => {
        if (n < 9) {
          n++;
          tempPages.push(
            `${i === 0 ? `${nowListen} Now Playing` : `${number[n - 1]}`} - ${
              song.name
            } | ${song.author}`
          );
          if (rowLen === i + 1) {
            pages.push(tempPages);
            tempPages = [];
          }
        } else {
          pages.push(tempPages);
          tempPages = [];

          n = 1;
          tempPages.push(
            `${i === 0 ? `${nowListen} Now Playing` : `${number[n - 1]}`} - ${
              song.name
            } | ${song.author}`
          );
        }
      }),
    ];

    // We'll now create a place to store the current page number...
    let current = 0;

    // ...and will now post a loading message which we will edit later.
    let m = await message.channel.send(
      `<a:loading:826449832034041945> Loading pages...`
    );

    // We'll now create a function to create embed pages.
    function createEmbed(page) {
      // We'll just make the embed and return it.
      let embed = new Discord.MessageEmbed()
        .setColor("#ff9a00")
        .setTitle(` <a:now:826450202935427123> Current Queue`)
        .setDescription(pages[page]);
      return embed;
    }

    // We'll also create another function to determine whether we need to show reactions.
    function reactionsNeeded(page) {
      // We'll now return an ARRAY with the results.
      // The first element will be backwards, second will be forwards.
      return [pages[page - 1], pages[page + 1]];
    }

    // Next, we'll make another function which will be used to show pages.
    async function showPage(page) {
      // We'll quickly use our createEmbed function to get the page we need...
      let output = createEmbed(page);

      // ...and then we'll edit our original message with the new embed.
      // We set the message content to NULL to remove the original loading message and then attach our embed to the message.
      await m.edit(null, { embed: output });

      // To make sure our reaction system works, we'll remove all previous reactions, if there is any.
      await m.reactions.removeAll();

      // We'll create a couple variables to store our reaction listeners in and our reactionNeeded result.
      let needed = reactionsNeeded(page);
      let left, right;

      // If we actually need to add a backwards reaction, we will.
      if (needed[0]) {
        // As it's needed, we'll add the reaction.
        await m.react("<a:esquerda:826455346661949463>");

        // We'll quickly create a reaction collector filter so we only collect the right events...
        let filter = (r, u) =>
          r.emoji.name == "esquerda" && u.id == message.author.id;

        // ...and then set the variable we made earlier. We'll make sure our collector times out after 60,000ms (60 seconds).
        left = m.createReactionCollector(filter, { time: 60000 });

        // We'll now handle the add reaction event.
        left.on("collect", (r) => {
          // We'll stop listening for any more reactions here...
          if (right) right.stop();
          left.stop();

          // ...and will then show the new page and update the current page.
          showPage(current - 1);
          current = current - 1;
        });
      }

      // We'll now do that again for the other reaction. Only minor changes are made.
      if (needed[1]) {
        await m.react("<a:direita:826455346863669339>");

        let filter = (r, u) =>
          r.emoji.name == "direita" && u.id == message.author.id;
        right = m.createReactionCollector(filter, { time: 60000 });

        right.on("collect", (r) => {
          if (left) left.stop();
          right.stop();

          showPage(current + 1);
          current = current + 1;
        });
      }
    }

    // Now we've done that, we will now create our page system.
    showPage(current);
  },
};
