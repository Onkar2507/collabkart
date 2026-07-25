import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requestData, setRequestData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const typingFieldRef = useRef(null);
  const typingWriteIdRef = useRef(0);
  const requestStatusRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Real-time collaboration request listener
  useEffect(() => {
    if (!user || !requestId) return;

    const requestRef = doc(db, "requests", requestId);

    const unsubscribe = onSnapshot(
      requestRef,
      (requestSnap) => {
        if (!requestSnap.exists()) {
          setRequestData(null);
          setError("Collaboration request not found.");
          setLoading(false);
          return;
        }

        const data = requestSnap.data();

        if (
          data.status !== "accepted" &&
          data.status !== "completed"
        ) {
          setRequestData(null);
          setError(
            "Chat is available only for accepted or completed collaborations."
          );
          setLoading(false);
          return;
        }

        if (
          data.brandId !== user.uid &&
          data.influencerId !== user.uid
        ) {
          setRequestData(null);
          setError(
            "You are not a participant in this collaboration."
          );
          setLoading(false);
          return;
        }

        typingFieldRef.current =
          data.brandId === user.uid
            ? "brandTyping"
            : "influencerTyping";

        requestStatusRef.current = data.status;

        setRequestData(data);
        setError("");
      },
      (err) => {
        console.error(
          "Request listener error:",
          err
        );

        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, requestId]);

  // Real-time message listener
  useEffect(() => {
    if (
      !user ||
      !requestId ||
      (requestData?.status !== "accepted" &&
        requestData?.status !== "completed")
    ) {
      return;
    }

    const messagesQuery = query(
      collection(
        db,
        "requests",
        requestId,
        "messages"
      ),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messageList = snapshot.docs.map(
          (messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          })
        );

        setMessages(messageList);
        setLoading(false);
      },
      (err) => {
        console.error(
          "Chat listener error:",
          err
        );

        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [
    user,
    requestId,
    requestData?.status,
  ]);

  // Scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const setTypingState = async (isTyping) => {
    const typingField =
      typingFieldRef.current;

    if (
      requestStatusRef.current !==
        "accepted" ||
      !typingField ||
      isTypingRef.current === isTyping
    ) {
      return;
    }

    isTypingRef.current = isTyping;

    const writeId =
      ++typingWriteIdRef.current;

    try {
      await updateDoc(
        doc(db, "requests", requestId),
        {
          [typingField]: isTyping,
        }
      );
    } catch (err) {
      console.error(
        "Error updating typing state:",
        err
      );

      setError(err.message);

      if (
        typingWriteIdRef.current === writeId
      ) {
        isTypingRef.current = !isTyping;
      }
    }
  };

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );

      typingTimeoutRef.current = null;
    }
  };

  const handleTextChange = (e) => {
    if (
      requestData?.status !== "accepted"
    ) {
      return;
    }

    const nextText = e.target.value;

    setText(nextText);
    clearTypingTimeout();

    if (!nextText.trim()) {
      void setTypingState(false);
      return;
    }

    void setTypingState(true);

    typingTimeoutRef.current =
      setTimeout(() => {
        void setTypingState(false);
      }, 1500);
  };

  useEffect(() => {
    return () => {
      clearTimeout(
        typingTimeoutRef.current
      );

      if (
        requestStatusRef.current !==
          "accepted" ||
        !isTypingRef.current ||
        !typingFieldRef.current
      ) {
        return;
      }

      isTypingRef.current = false;

      updateDoc(
        doc(db, "requests", requestId),
        {
          [typingFieldRef.current]: false,
        }
      ).catch((err) => {
        console.error(
          "Error clearing typing state:",
          err
        );
      });
    };
  }, [requestId]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (
      !text.trim() ||
      !user ||
      requestData?.status !== "accepted"
    ) {
      return;
    }

    setSending(true);
    setError("");

    clearTypingTimeout();

    await setTypingState(false);

    try {
      await addDoc(
        collection(
          db,
          "requests",
          requestId,
          "messages"
        ),
        {
          senderId: user.uid,
          text: text.trim(),
          createdAt: serverTimestamp(),
        }
      );

      setText("");
    } catch (err) {
      console.error(
        "Error sending message:",
        err
      );

      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <main className="page-container">
        <div className="dashboard-loading">
          Loading...
        </div>
      </main>
    );
  }

  if (error && !requestData) {
    return (
      <main className="page-container chat-page">
        <div className="chat-error card">
          <div className="chat-error-icon">
            !
          </div>

          <h2>Chat unavailable</h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page-container">
        <div className="dashboard-loading">
          Loading conversation...
        </div>
      </main>
    );
  }

  const isBrand =
    requestData?.brandId === user.uid;

  const otherPersonName = isBrand
    ? requestData?.influencerName
    : requestData?.brandName;

  const otherInitial = (
    otherPersonName || "C"
  )
    .charAt(0)
    .toUpperCase();

  const otherPersonTyping = isBrand
    ? requestData?.influencerTyping
    : requestData?.brandTyping;

  return (
    <main className="page-container chat-page">

      {/* Page Heading */}

      <header className="chat-page-heading">
        <div>
          <span className="dashboard-eyebrow">
            COLLABORATION
          </span>

          <h1>Messages</h1>

          <p>
            Communicate directly about your
            collaboration.
          </p>
        </div>
      </header>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Main Chat */}

      <section className="chat-shell card">

        {/* Chat Header */}

        <header className="chat-header">

          <div className="chat-participant">

            <div className="chat-participant-avatar">
              {otherInitial}
            </div>

            <div>
              <h2>{otherPersonName}</h2>

              <div className="chat-participant-meta">
                <span
                  className={`chat-status-dot ${
                    requestData.status ===
                    "accepted"
                      ? "active"
                      : ""
                  }`}
                />

                <span>
                  {requestData.status ===
                  "accepted"
                    ? "Active collaboration"
                    : "Completed collaboration"}
                </span>
              </div>
            </div>

          </div>

          <div className="chat-header-right">

            <span
              className={`status-badge status-${requestData.status}`}
            >
              {requestData.status}
            </span>

            <button
              type="button"
              className="btn btn-secondary chat-back-btn"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

          </div>

        </header>

        {/* Collaboration Info */}

        <div className="chat-collaboration-info">

          <div>
            <span>Brand</span>
            <strong>
              {requestData.brandName}
            </strong>
          </div>

          <div>
            <span>Creator</span>
            <strong>
              {requestData.influencerName}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>
              {requestData.status ===
              "accepted"
                ? "In Progress"
                : "Completed"}
            </strong>
          </div>

        </div>

        {/* Messages */}

        <div className="chat-messages">

          {messages.length === 0 ? (
            <div className="chat-empty">

              <div className="chat-empty-icon">
                ◇
              </div>

              <h3>
                Start the conversation
              </h3>

              <p>
                Send a message to{" "}
                {otherPersonName} about this
                collaboration.
              </p>

            </div>
          ) : (
            messages.map((message) => {
              const ownMessage =
                message.senderId === user.uid;

              return (
                <div
                  className={`chat-message-row ${
                    ownMessage
                      ? "chat-message-own"
                      : "chat-message-other"
                  }`}
                  key={message.id}
                >
                  {!ownMessage && (
                    <div className="chat-message-avatar">
                      {otherInitial}
                    </div>
                  )}

                  <div className="chat-message-content">

                    <span className="chat-message-sender">
                      {ownMessage
                        ? "You"
                        : otherPersonName}
                    </span>

                    <div className="chat-message-bubble">
                      {message.text}
                    </div>

                  </div>
                </div>
              );
            })
          )}

          {/* Typing */}

          {requestData.status ===
            "accepted" &&
            otherPersonTyping && (
              <div className="chat-typing">
                <div className="chat-message-avatar">
                  {otherInitial}
                </div>

                <div className="chat-typing-content">
                  <span>
                    {otherPersonName} is typing
                  </span>

                  <div className="typing-dots">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            )}

          <div ref={messagesEndRef} />

        </div>

        {/* Composer */}

        {requestData.status ===
        "accepted" ? (

          <form
            className="chat-composer"
            onSubmit={handleSend}
          >

            <input
              type="text"
              placeholder={`Message ${otherPersonName}...`}
              value={text}
              onChange={handleTextChange}
              disabled={sending}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                sending || !text.trim()
              }
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>

          </form>

        ) : (

          <div className="chat-completed-notice">

            <div className="chat-completed-icon">
              ✓
            </div>

            <div>
              <strong>
                Collaboration completed
              </strong>

              <span>
                This conversation is now
                read-only. Previous messages
                remain available.
              </span>
            </div>

          </div>

        )}

      </section>

    </main>
  );
}