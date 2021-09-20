
const Discord = require('discord.js')


const config = require('./config.json');


const Client = new Discord.Client({disableEveryone: true});


Client.commands = new Discord.Collection();


const fs = require('fs');

const db = require('quick.db')

const prefix = ('m!');



Client.aliases = new Discord.Collection();

const cooldown = new Set();

const Canvacord = require('canvacord')


 







fs.readdirSync('./commands/').forEach(dir => {

    fs.readdir(`./commands/${dir}`, (err, files) => {


        if (err) throw err;

        
        var jsFiles = files.filter(f => f.split(".").pop() === "js");

     
        if (jsFiles.length <= 0) {
          console.log("Can't find any commands!");
          return;
        }

        
        jsFiles.forEach(file => {

          
            var fileGet = require(`./commands/${dir}/${file}`);
            console.log(`File ${file} was loaded`)

      
            try {
                Client.commands.set(fileGet.help.name, fileGet);

              
                fileGet.help.aliases.forEach(alias => {
                    Client.aliases.set(alias, fileGet.help.name);
                })

            } catch (err) {
                
                return console.log(err);
            }
        });
    });
});
















Client.on("ready", async () => {
    console.log(`${Client.user.username} is Online!`)
    const arrayOfStatus = [
        `m!status | ${Client.guilds.cache.size} Servers`,
        `m!invite | ${Client.channels.cache.size} Channels`,
        `m!upvote | Wicks wil be back soon`,
        `m!help | ${Client.users.cache.size} Users`,
        `www.wicksbot.xyz`
    ];

    let index = 0;
    setInterval (() => {
        if(index === arrayOfStatus.length) index = 0;
        const status = arrayOfStatus[index];
        console.log(status);
        Client.user.setActivity(status, {type: "STREAMING"}).catch(console.error)
        index++;
       }, 5000)
    
})

Client.on("guildCreate", guild => {
    const embed = new Discord.MessageEmbed()
    .setTitle("New Server <:emoji_48:881129511654150184>")
    .setColor('#303136')
    .setDescription(`I'm added to ${guild.name}, with ${guild.memberCount}\n\nTotal server: ${Client.guilds.cache.size}\nTotal users: ${Client.users.cache.size}`)
    .setTimestamp()
    const LogChannel = Client.channels.cache.get('870755152817160242')
    LogChannel.send(embed)
})


Client.on("guildDelete", guild => {
    const embed = new Discord.MessageEmbed()
    .setTitle("Server left <:emoji_49:881129542691979274>")
    .setColor('#303136')
    .setDescription(`I left ${guild.name}, that had ${guild.memberCount}\n\nTotal server: ${Client.guilds.cache.size}\nTotal users: ${Client.users.cache.size}`)
    const LogChannel = Client.channels.cache.get('870755152817160242')
    LogChannel.send(embed)
})


Client.on("message", async (message, guild) => {

    if(message.author.Client || message.channel.type === "dm") return;


    

    if(db.has(`afk-${message.author.id}+${message.guild.id}`)) { 
        const oldReason = db.get(`afk-${message.author.id}+${message.guild.id}`)  
        await db.delete(`afk-${message.author.id}+${message.guild.id}`) 
        message.reply(`you aren't afk anymore, that was the reason:\n ${oldReason}`) 
    }


    // checking if someone mentioned the afk person

    if(message.mentions.members.first()) { // if someone mentioned the person
        if(db.has(`afk-${message.mentions.members.first().id}+${message.guild.id}`)) { 
            message.channel.send(message.mentions.members.first().user.tag + " : " + db.get(`afk-${message.mentions.members.first().id}+${message.guild.id}`)) // if yes, it gets from the db the afk msg and send it
        }
     }

    let prefix;
// no one did =setprefix
    let prefixes = await db.fetch(`prefix_${message.guild.id}`);
    if(prefixes == null) {
        prefix = "m!" // this will be the default prefix
    } else {
        prefix = prefixes;
    }
    
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1)

    // it will make the cmd work with him orginal name and his aliases
    let commands = Client.commands.get(cmd.slice(prefix.length)) || Client.commands.get(Client.aliases.get(cmd.slice(prefix.length)));

    if(commands) commands.run(Client, message, args, prefix);

    xp(message)
    if(message.content.startsWith(`${prefix}rank`)) {
    if(message.author.bot) return;
    var user = message.mentions.users.first() || message.author;
    var level = db.fetch(`guild_${message.guild.id}_level_${user.id}`) || 0;
    var currentxp = db.fetch(`guild_${message.guild.id}_xp_${user.id}`) || 0;
    var xpNeeded = level * 500 + 500 // 500 + 1000 + 1500
    const rankcard = new Canvacord.Rank()
        .setAvatar(user.displayAvatarURL({format: 'png', dynamic: true}))
        .setCurrentXP(db.fetch(`guild_${message.guild.id}_xp_${user.id}`) || 0)
        .setRequiredXP(xpNeeded)
        .setStatus(user.presence.status)
        .setLevel(db.fetch(`guild_${message.guild.id}_level_${user.id}`) || 0)
        .setRank(1, 'RANK', false)
        .setProgressBar("#a81d16", "COLOR")
        .setOverlay("#000000")
        .setUsername(user.username)
        .setDiscriminator(user.discriminator)
        .setBackground("COLOR", "#808080")
        rankcard.build()
        .then(data => {
            const atta = new Discord.MessageAttachment(data, "rank.png")
            message.channel.send(atta)
        })
    }

    function xp(message) {
        if(message.author.bot) return
        const randomNumber = Math.floor(Math.random() * 10) + 15;
        db.add(`guild_${message.guild.id}_xp_${message.author.id}`, randomNumber) 
        db.add(`guild_${message.guild.id}_xptotal_${message.author.id}`, randomNumber)
        var level = db.get(`guild_${message.guild.id}_level_${message.author.id}`) || 1
        var xp = db.get(`guild_${message.guild.id}_xp_${message.author.id}`)
        var xpNeeded = level * 500;
        if(xpNeeded < xp){
            var newLevel = db.add(`guild_${message.guild.id}_level_${message.author.id}`, 1) 
            db.subtract(`guild_${message.guild.id}_xp_${message.author.id}`, xpNeeded)
            message.channel.send(`Congrats ${message.author}, you leveled up, you are now level ${newLevel}`)
        }
    }
    

})









Client.login(config.token)