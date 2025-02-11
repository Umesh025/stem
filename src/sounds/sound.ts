// Sound effect URLs from mixkit.co (free sound effects)
export const SOUNDS = {
    correct: 'src/sounds/2000-preview.mp3',
    wrong: 'src/sounds/2003-preview.mp3',
};

class SoundManager {
    private sounds: { [key: string]: HTMLAudioElement } = {};
    private isMuted = false;

    constructor() {
        Object.entries(SOUNDS).forEach(([key, url]) => {
            this.sounds[key] = new Audio(url);
        });
    }

    play(soundName: keyof typeof SOUNDS) {
        if (this.isMuted) return;

        const sound = this.sounds[soundName];
        console.log(`Playing sound: ${soundName}, URL: ${sound.src}`);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.error('Error playing sound:', error);
            });
        } else {
            console.error(`Sound not found: ${soundName}`);
        }
    }

    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopAll();
        }
        return this.isMuted;
    }
}

export const soundManager = new SoundManager();