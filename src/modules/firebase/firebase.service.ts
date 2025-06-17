import { Injectable } from '@nestjs/common';
import admin from './firebase-admin';

@Injectable()
export class FirebaseService {
  async verifyIdToken(idToken: string) {
    return await admin.auth().verifyIdToken(idToken);
  }

  async getUser(uid: string) {
    return await admin.auth().getUser(uid);
  }

  // Thêm các hàm khác nếu cần, ví dụ gửi thông báo push
}
