# twitch-chat-emotes-threejs
A Three.JS specific variant of the [twitch-chat-emotes](https://github.com/CalebBabin/twitch-chat-emotes) package.

[Example repository](https://github.com/moonscreens/intro-example-threejs)

```js
import TwitchChat from 'twitch-chat-emotes-threejs';
import * as THREE from 'three';

const ChatInstance = new TwitchChat({
	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: THREE.SpriteMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
	},

	materialHook: material => console.log, // receives unique emote materials on creation

	textureHook: texture => { // receives unique emote textures on creation
		texture.colorSpace = THREE.SRGBColorSpace; // fixes washed out colors
	},

	channels,
	maximumEmoteLimit: 3,
});

ChatInstance.listen((emotes) => { //receives an array of "emote" objects, THREE.js material is within emotes[i].material
	console.log(emotes);
});
``
