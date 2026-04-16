import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../../firebase';

@Injectable({ providedIn: 'root' })
export class VoiceRecorderService {
  private storage = getStorage();

  async uploadVoiceNote(userId: string, blob: Blob): Promise<string> {
    const path = `voice-notes/${userId}/${Date.now()}.webm`;
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  }
}
