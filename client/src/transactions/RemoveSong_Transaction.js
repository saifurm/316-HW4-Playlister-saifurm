import { jsTPS_Transaction } from "jstps"

/**
 * DeleteSong_Transaction
 * 
 * This class represents a transaction that deletes a song
 * in the playlist. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 */
export default class RemoveSong_Transaction extends jsTPS_Transaction {
    constructor(initStore, initIndex, initSong) {
        super();
        this.store = initStore;
        this.index = initIndex;
        this.song = initSong;
    }

    executeDo() {
        this.store.removeSong(this.index);
    }
    
    executeUndo() {
        this.store.createSong(this.index, this.song);
    }
}