import { DoubleSide, MeshBasicMaterial, Texture } from 'three';
import Chat from 'twitch-chat-emotes';

class TwitchEmotes {
	/**
	 * @param {Object} options The configuration object.
	 * @param {Object} options[].updateAutonomously If false, the library will not mark materials with "needsUpdate"
	 * @param {Object} options[].materialType The THREE material to use for the emote. Default: THREE.MeshBasicMaterial
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
		this.options = {
			materialType: MeshBasicMaterial,
			materialOptions: {
				transparent: true,
				side: DoubleSide,
				...options.materialOptions
			},
			...options
		};
		if (this.options.updateAutonomously === undefined) {
			this.options.updateAutonomously = true;
		}

		this.emotes = {};
		this.listeners = [];

		// create our chat instance
		this.EmoteService = new Chat(this.options)

		this.addCustomEmote = this.EmoteService.addCustomEmote.bind(this.EmoteService);

		// add a callback function for when a new message with emotes is sent
		this.EmoteService.on("emotes", (emotes) => {
			let output = [];
			for (let index = 0; index < emotes.length; index++) {
				const element = emotes[index];
				if (!this.emotes[element.url]) {
					this.emotes[element.url] = {
						texture: new Texture(element.canvas),
						element,
					};
					if (this.options.textureHook) {
						this.options.textureHook(this.emotes[element.url].texture, element.name);
					}
					this.emotes[element.url].material = new this.options.materialType({
						map: this.emotes[element.url].texture,
						...this.options.materialOptions
					})
					if (this.options.materialHook) {
						this.options.materialHook(this.emotes[element.url].material, element.name);
					}
				}
				output.push(this.emotes[element.url]);
			}
			this.listeners.forEach(cb => {
				cb(output);
			});
		})

		if (this.options.updateAutonomously) {
			this.updateAllEmotes();
		}
	}

	dispose () {
		this.EmoteService.dispose();
		this.disposing = true;
		delete this.emotes;
	}

	updateAllEmotes() {
		if (this.disposing === true) return;
		for (let key in this.emotes) {
			if (this.emotes[key] && this.emotes[key].element.needsUpdate) {
				this.emotes[key].element.needsUpdate = false;
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

export default TwitchEmotes;