import { jsTPS_Transaction } from "jstps"

/**
 * UpdateSong_Transaction
 * 
 * This class represents a transaction that updates a song
 * in the playlist. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 */
export default class UpdateSong_Transaction extends jsTPS_Transaction {
    constructor(initStore, initIndex, initOldSongData, initNewSongData) {
        super();
        this.store = initStore;
        this.index = initIndex;
        this.oldSongData = initOldSongData;
        this.newSongData = initNewSongData;
    }

    executeDo() {
        this.store.updateSong(this.index, this.newSongData);
    }
    
    executeUndo() {
        this.store.updateSong(this.index, this.oldSongData);
    }
}