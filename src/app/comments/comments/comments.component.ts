import { Component, OnInit, Input } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Comment } from './comment.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styles: [`
    .avatar {
      border-radius: 100px;
      display: inline-block;
      height: 20px;
    }
    .link {
      color: #
    }
  `]
})
export class CommentsComponent implements OnInit {
  private _commentsRef: AngularFireList<Comment>;
  comments$: Observable<Comment[]>;

  constructor(
    private db: AngularFireDatabase,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this._commentsRef = this.db.list<Comment>(
      'comments',
      ref => ref.orderByChild('timestamp').limitToLast(15)
    );
    this.comments$ = this._commentsRef.snapshotChanges().map(
      changes => {
        return changes.map(
          c => ({ key: c.payload.key, ...c.payload.val() })
        );
      }
    );
  }

  onPostComment(data: Comment) {
    this._commentsRef.push(data);
  }

  canDeleteComment(uid: string): boolean {
    if (!this.auth.userProfile) {
      return false;
    }
    return (uid === this.auth.userProfile.sub && this.auth.loggedInFirebase);
  }

  deleteComment(key: string) {
    if (window.confirm('Are you sure you want to delete your comment?')) {
      this._commentsRef.remove(key);
    }
  }

}
