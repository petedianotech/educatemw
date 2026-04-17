import { Injectable } from '@angular/core';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase';

@Injectable({ providedIn: 'root' })
export class VoiceRecorderService {
  async uploadVoiceNote(userId: string, blob: Blob): Promise<string> {
    const path = `voice-notes/${userId}/${Date.now()}.webm`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  }
}
