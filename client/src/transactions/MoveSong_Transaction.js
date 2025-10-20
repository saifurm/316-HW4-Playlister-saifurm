import { jsTPS_Transaction } from "jstps"
/**
 * MoveSong_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 */
export default class MoveSong_Transaction extends jsTPS_Transaction {
    constructor(initStore, initOldSongIndex, initNewSongIndex) {
        super();
        this.store = initStore;
        this.oldSongIndex = initOldSongIndex;
        this.newSongIndex = initNewSongIndex;
    }

    executeDo() {
        this.store.moveSong(this.oldSongIndex, this.newSongIndex);
    }
    
    executeUndo() {
        this.store.moveSong(this.newSongIndex, this.oldSongIndex);
    }
}