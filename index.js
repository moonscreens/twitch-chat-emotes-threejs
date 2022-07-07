import Chat from 'twitch-chat-emotes';

class TwitchChat {
	/**
	 * @param {Object} options The configuration object.
	 * @param {Object} options[].THREE REQUIRED, The THREE.js library.
	 * @param {Object} options[].updateAutonomously If false, the library will not mark materials with "needsUpdate"
	 * @param {Object} options[].materialType The material to use for the emote. You should pass in a Material from THREE. Default: MeshBasicMaterial
	 * @param {Object} options[].materialOptions options to be passed to the material. Default: { map: emoteTexture }
	 * @param {Number} options[].channels An array of twitch channels to connect to, example: ["moonmoon"]
	 * @param {Number} options[].maximumEmoteLimit The maximum number of emotes permitted for a single message.
	 * @param {Number} options[].maximumEmoteLimit_pleb The maximum number of emotes permitted for a single message from an unsubscribed user, defaults to maximumEmoteLimit.
	 * @param {Number} options[].duplicateEmoteLimit The number of duplicate emotes permitted for a single message.
	 * @param {Number} options[].duplicateEmoteLimit_pleb The number of duplicate emotes permitted for a single message from an unsubscribed user, defaults to duplicateEmoteLimit.
	 * @param {Number} options[].gifAPI Define the URL of your own GIF parsing server.
	 * @param {Function} options[].textureHook Define a function to be called when a texture is created.
	 * @param {Function} options[].materialHook Define a function to be called when an material is created.
	 */
	constructor(options) {
		if (!options.hasOwnProperty('THREE')) {
			throw new Error('THREE needs to be passed to TwitchChat constructor');
		}


		this.options = {
			materialType: options.THREE.MeshBasicMaterial,
			materialOptions: {
				transparent: true,
				side: options.THREE.DoubleSide,
				...options.materialOptions
			},
			...options
		};
		if (this.options.updateAutonomously === undefined) {
			this.options.updateAutonomously = true;
		}

		this.chat = new Chat(options);

		this.emotes = {};
		this.listeners = [];

		// create our chat instance
		this.ChatInstance = new Chat(this.options)

		// add a callback function for when a new message with emotes is sent
		this.ChatInstance.on("emotes", (emotes) => {
			let output = [];
			for (let index = 0; index < emotes.length; index++) {
				const element = emotes[index];
				if (!this.emotes[element.id]) {
					this.emotes[element.id] = {
						texture: new this.options.THREE.CanvasTexture(element.gif.canvas),
						name: element.name,
						id: element.id,
						gif: element.gif,
					};
					if (this.options.textureHook) {
						this.options.textureHook(this.emotes[element.id].texture);
					}
					this.emotes[element.id].material = new this.options.materialType({
						map: this.emotes[element.id].texture,
						...this.options.materialOptions
					})
					if (this.options.materialHook) {
						this.options.materialHook(this.emotes[element.id].material);
					}
				}
				output.push(this.emotes[element.id]);
			}
			this.listeners.forEach(cb => {
				cb(output);
			});
		})

		if (this.options.updateAutonomously) {
			this.updateAllEmotes();
		}
	}

	updateAllEmotes() {
		for (let key in this.emotes) {
			this.emotes[key].texture.needsUpdate = true;
			if (this.emotes[key].gif && this.emotes[key].gif.needsUpdate) {
				this.emotes[key].gif.needsUpdate = false;
				this.emotes[key].texture.needsUpdate = true;
			}
		}
		if (this.options.updateAutonomously) {
			window.requestAnimationFrame(this.updateAllEmotes.bind(this));
		}
	}

	/**
	 * @param {Function} callback called with an array of THREE.Material objects each time a chat message with emotes is sent.
	 */
	listen(callback) {
		this.listeners.push(callback);
	}
}

export default TwitchChat;