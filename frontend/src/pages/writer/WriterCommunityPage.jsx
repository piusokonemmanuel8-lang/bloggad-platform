import { useEffect, useState } from 'react';
import { MessageCircle, Send, Users, X } from 'lucide-react';
import api from '../../api/axios';
import { formatDateTime } from '../../components/writerReader/WorkspaceUi';

function readerName(item) {
  if (item?.reader_name) return item.reader_name;
  if (item?.reader_user_id) return `Reader #${item.reader_user_id}`;
  return 'Reader';
}

function readerInitial(item) {
  const name = readerName(item).trim();
  return (name.charAt(0) || 'R').toUpperCase();
}

export default function WriterCommunityPage() {
  const [followers, setFollowers] = useState([]);
  const [comments, setComments] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [activeTab, setActiveTab] = useState('comments');
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyBusyId, setReplyBusyId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');

      const [followersRes, commentsRes] = await Promise.all([
        api.get('/api/writer/social/followers'),
        api.get('/api/writer/social/comments'),
      ]);

      setFollowers(followersRes?.data?.followers || []);
      setComments(commentsRes?.data?.comments || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Writer community.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function reply(commentId) {
    const body = String(replyDrafts[commentId] || '').trim();
    if (!body || replyBusyId !== null) return;

    try {
      setReplyBusyId(commentId);
      setError('');

      await api.post(`/api/writer/social/comments/${commentId}/reply`, { body });

      setReplyDrafts((previous) => ({
        ...previous,
        [commentId]: '',
      }));
      setReplyOpenId(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reply.');
    } finally {
      setReplyBusyId(null);
    }
  }

  function openReply(commentId) {
    setReplyOpenId((current) => (current === commentId ? null : commentId));
  }

  return (
    <div className="writer-community-page">
      <div className="writer-community-mobile-title">Community</div>

      {error ? (
        <div className="writer-community-alert" role="alert">
          {error}
        </div>
      ) : null}

      <section className="writer-community-panel">
        <div className="writer-community-tabs" role="tablist" aria-label="Community views">
          <button
            type="button"
            className={`writer-community-tab${activeTab === 'comments' ? ' active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'comments'}
            onClick={() => setActiveTab('comments')}
          >
            <MessageCircle size={15} strokeWidth={1.9} />
            <span>Reader comments</span>
            <span className="writer-community-count">{comments.length}</span>
          </button>

          <button
            type="button"
            className={`writer-community-tab${activeTab === 'followers' ? ' active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'followers'}
            onClick={() => setActiveTab('followers')}
          >
            <Users size={15} strokeWidth={1.9} />
            <span>Followers</span>
            <span className="writer-community-count">{followers.length}</span>
          </button>
        </div>

        {activeTab === 'comments' ? (
          <div className="writer-community-comments" role="tabpanel">
            {comments.length ? (
              comments.map((item) => {
                const replyOpen = Number(replyOpenId) === Number(item.id);
                const isSending = Number(replyBusyId) === Number(item.id);
                const replyCount = Number(item.reply_count || 0);

                return (
                  <article className="writer-community-comment" key={item.id}>
                    <div className="writer-community-comment-top">
                      <div className="writer-community-reader">
                        <div className="writer-community-avatar" aria-hidden="true">
                          {readerInitial(item)}
                        </div>

                        <div className="writer-community-reader-copy">
                          <strong>{readerName(item)}</strong>
                          <span>{formatDateTime(item.created_at)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`writer-community-reply-trigger${replyOpen ? ' active' : ''}`}
                        onClick={() => openReply(item.id)}
                        aria-expanded={replyOpen}
                      >
                        <MessageCircle size={14} strokeWidth={1.9} />
                        Reply
                      </button>
                    </div>

                    <div className="writer-community-post-title">
                      {item.post_title || 'Post'}
                    </div>

                    <p className="writer-community-comment-body">{item.body}</p>

                    {replyCount > 0 ? (
                      <div className="writer-community-reply-count">
                        {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                      </div>
                    ) : null}

                    {replyOpen ? (
                      <div className="writer-community-composer">
                        <div className="writer-community-composer-head">
                          <strong>Reply as Writer</strong>
                          <button
                            type="button"
                            className="writer-community-composer-close"
                            onClick={() => setReplyOpenId(null)}
                            aria-label="Close reply"
                          >
                            <X size={15} strokeWidth={1.9} />
                          </button>
                        </div>

                        <textarea
                          className="writer-community-textarea"
                          rows={4}
                          placeholder="Write your reply..."
                          value={replyDrafts[item.id] || ''}
                          onChange={(event) =>
                            setReplyDrafts((previous) => ({
                              ...previous,
                              [item.id]: event.target.value,
                            }))
                          }
                          disabled={isSending}
                        />

                        <div className="writer-community-composer-actions">
                          <button
                            type="button"
                            className="writer-community-btn secondary"
                            onClick={() => setReplyOpenId(null)}
                            disabled={isSending}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="writer-community-btn primary"
                            onClick={() => reply(item.id)}
                            disabled={
                              isSending ||
                              !String(replyDrafts[item.id] || '').trim()
                            }
                          >
                            <Send size={14} strokeWidth={1.9} />
                            {isSending ? 'Sending...' : 'Send reply'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <div className="writer-community-empty">
                <span className="writer-community-empty-icon">
                  <MessageCircle size={18} strokeWidth={1.8} />
                </span>
                <strong>No Reader comments yet.</strong>
                <span>New comments on your posts will appear here.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="writer-community-followers" role="tabpanel">
            {followers.length ? (
              followers.map((item) => (
                <div className="writer-community-follower" key={item.reader_user_id}>
                  <div className="writer-community-reader">
                    <div className="writer-community-avatar" aria-hidden="true">
                      {readerInitial(item)}
                    </div>

                    <div className="writer-community-reader-copy">
                      <strong>{readerName(item)}</strong>
                      <span>Followed {formatDateTime(item.followed_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="writer-community-empty">
                <span className="writer-community-empty-icon">
                  <Users size={18} strokeWidth={1.8} />
                </span>
                <strong>No followers yet.</strong>
                <span>Readers who follow your Writer profile will appear here.</span>
              </div>
            )}
          </div>
        )}
      </section>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .writer-community-page {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    color: #1d2025;
  }

  .writer-community-mobile-title {
    display: none;
  }

  .writer-community-alert {
    margin-bottom: 14px;
    padding: 11px 13px;
    border: 1px solid #fecaca;
    border-radius: 9px;
    background: #fff7f7;
    color: #b42318;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 650;
  }

  .writer-community-panel {
    min-width: 0;
    overflow: hidden;
    border: 1px solid #e1e4e8;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(20, 24, 31, 0.02);
  }

  .writer-community-tabs {
    min-height: 54px;
    padding: 0 18px;
    border-bottom: 1px solid #e7e9ec;
    display: flex;
    align-items: stretch;
    gap: 6px;
  }

  .writer-community-tab {
    min-width: 0;
    padding: 0 9px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: #717983;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font: inherit;
    font-size: 12px;
    line-height: 1;
    font-weight: 680;
    cursor: pointer;
  }

  .writer-community-tab:hover {
    color: #2e343c;
  }

  .writer-community-tab.active {
    border-bottom-color: #20242a;
    color: #1d2025;
  }

  .writer-community-count {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: #f0f2f4;
    color: #6f7781;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 800;
  }

  .writer-community-tab.active .writer-community-count {
    background: #e9ebee;
    color: #30363d;
  }

  .writer-community-comments,
  .writer-community-followers {
    min-width: 0;
  }

  .writer-community-comment {
    padding: 19px 22px 20px;
  }

  .writer-community-comment + .writer-community-comment {
    border-top: 1px solid #eceef0;
  }

  .writer-community-comment-top {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .writer-community-reader {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-community-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #eceef0;
    color: #424951;
    display: grid;
    place-items: center;
    flex: 0 0 34px;
    font-size: 11px;
    font-weight: 800;
  }

  .writer-community-reader-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .writer-community-reader-copy strong {
    min-width: 0;
    overflow: hidden;
    color: #282d33;
    font-size: 12px;
    line-height: 1.25;
    font-weight: 730;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .writer-community-reader-copy span {
    color: #8a919a;
    font-size: 10px;
    line-height: 1.35;
    font-weight: 550;
  }

  .writer-community-reply-trigger {
    min-height: 30px;
    padding: 0 9px;
    border: 1px solid #e0e3e6;
    border-radius: 7px;
    background: #ffffff;
    color: #5f6873;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-shrink: 0;
    font: inherit;
    font-size: 10px;
    font-weight: 680;
    cursor: pointer;
  }

  .writer-community-reply-trigger:hover,
  .writer-community-reply-trigger.active {
    border-color: #cfd4d9;
    background: #f6f7f8;
    color: #20242a;
  }

  .writer-community-post-title {
    margin: 14px 0 7px 44px;
    color: #8c939c;
    font-size: 9px;
    line-height: 1.4;
    font-weight: 760;
    letter-spacing: 0.045em;
    text-transform: uppercase;
  }

  .writer-community-comment-body {
    margin: 0 0 0 44px;
    max-width: 830px;
    color: #3c434b;
    font-size: 12px;
    line-height: 1.65;
    font-weight: 450;
    overflow-wrap: anywhere;
  }

  .writer-community-reply-count {
    margin: 9px 0 0 44px;
    color: #90969e;
    font-size: 9px;
    line-height: 1.4;
    font-weight: 650;
  }

  .writer-community-composer {
    margin: 15px 0 0 44px;
    max-width: 760px;
    padding: 13px;
    border: 1px solid #dde1e5;
    border-radius: 9px;
    background: #fafbfb;
  }

  .writer-community-composer-head {
    margin-bottom: 9px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .writer-community-composer-head strong {
    color: #3b424a;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 740;
  }

  .writer-community-composer-close {
    width: 25px;
    height: 25px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #838b94;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .writer-community-composer-close:hover {
    background: #eceff1;
    color: #333a42;
  }

  .writer-community-textarea {
    width: 100%;
    min-height: 88px;
    padding: 10px 11px;
    border: 1px solid #d9dde1;
    border-radius: 8px;
    outline: 0;
    background: #ffffff;
    color: #24292f;
    font: inherit;
    font-size: 11px;
    line-height: 1.55;
    resize: vertical;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .writer-community-textarea::placeholder {
    color: #a0a6ad;
  }

  .writer-community-textarea:focus {
    border-color: #8d949c;
    box-shadow: 0 0 0 2px rgba(32, 36, 42, 0.06);
  }

  .writer-community-textarea:disabled {
    background: #f5f6f7;
    color: #818891;
  }

  .writer-community-composer-actions {
    margin-top: 9px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 7px;
  }

  .writer-community-btn {
    min-height: 31px;
    padding: 0 11px;
    border-radius: 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font: inherit;
    font-size: 10px;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
  }

  .writer-community-btn.secondary {
    border: 1px solid #dfe3e6;
    background: #ffffff;
    color: #5f6873;
  }

  .writer-community-btn.primary {
    border: 1px solid #20242a;
    background: #20242a;
    color: #ffffff;
  }

  .writer-community-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .writer-community-follower {
    min-height: 64px;
    padding: 14px 22px;
    display: flex;
    align-items: center;
  }

  .writer-community-follower + .writer-community-follower {
    border-top: 1px solid #eceef0;
  }

  .writer-community-empty {
    min-height: 210px;
    padding: 40px 22px;
    color: #858d96;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .writer-community-empty-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 11px;
    border-radius: 50%;
    background: #f0f2f4;
    color: #737b85;
    display: grid;
    place-items: center;
  }

  .writer-community-empty strong {
    margin-bottom: 4px;
    color: #444b53;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 730;
  }

  .writer-community-empty > span:last-child {
    max-width: 340px;
    color: #9399a1;
    font-size: 10px;
    line-height: 1.55;
    font-weight: 500;
  }

  @media (max-width: 767px) {
    .writer-community-page {
      max-width: none;
    }

    .writer-community-mobile-title {
      display: block;
      margin: 1px 0 15px;
      color: #20242a;
      font-size: 18px;
      line-height: 1.2;
      font-weight: 760;
      letter-spacing: -0.02em;
    }

    .writer-community-alert {
      margin-bottom: 11px;
      font-size: 11px;
    }

    .writer-community-panel {
      border-radius: 10px;
    }

    .writer-community-tabs {
      min-height: 50px;
      padding: 0 10px;
      gap: 2px;
    }

    .writer-community-tab {
      padding: 0 7px;
      gap: 5px;
      font-size: 10px;
    }

    .writer-community-count {
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      font-size: 8px;
    }

    .writer-community-comment {
      padding: 15px 14px 16px;
    }

    .writer-community-comment-top {
      gap: 10px;
      align-items: flex-start;
    }

    .writer-community-avatar {
      width: 32px;
      height: 32px;
      flex-basis: 32px;
      font-size: 10px;
    }

    .writer-community-reader {
      gap: 9px;
    }

    .writer-community-reader-copy strong {
      font-size: 11px;
    }

    .writer-community-reader-copy span {
      font-size: 9px;
    }

    .writer-community-reply-trigger {
      min-height: 29px;
      padding: 0 8px;
      font-size: 9px;
    }

    .writer-community-post-title,
    .writer-community-comment-body,
    .writer-community-reply-count,
    .writer-community-composer {
      margin-left: 41px;
    }

    .writer-community-post-title {
      margin-top: 11px;
      font-size: 8px;
    }

    .writer-community-comment-body {
      font-size: 11px;
      line-height: 1.6;
    }

    .writer-community-composer {
      margin-top: 12px;
      padding: 11px;
    }

    .writer-community-textarea {
      min-height: 82px;
      font-size: 10px;
    }

    .writer-community-btn {
      min-height: 30px;
      font-size: 9px;
    }

    .writer-community-follower {
      min-height: 60px;
      padding: 13px 14px;
    }

    .writer-community-empty {
      min-height: 180px;
      padding: 34px 18px;
    }
  }

  @media (max-width: 420px) {
    .writer-community-tab svg {
      display: none;
    }

    .writer-community-tab {
      flex: 1 1 auto;
      justify-content: center;
    }

    .writer-community-comment-top {
      align-items: center;
    }

    .writer-community-reply-trigger {
      padding: 0 7px;
    }

    .writer-community-reply-trigger svg {
      display: none;
    }

    .writer-community-post-title,
    .writer-community-comment-body,
    .writer-community-reply-count,
    .writer-community-composer {
      margin-left: 0;
    }

    .writer-community-post-title {
      margin-top: 12px;
    }

    .writer-community-composer-actions {
      justify-content: stretch;
    }

    .writer-community-btn {
      flex: 1 1 0;
    }
  }
`;
