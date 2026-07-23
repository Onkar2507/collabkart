import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

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

        if (data.status !== "accepted") {
          setRequestData(null);
          setError("Chat is available only for accepted collaborations.");
          setLoading(false);
          return;
        }

        if (data.brandId !== user.uid && data.influencerId !== user.uid) {
          setRequestData(null);
          setError("You are not a participant in this collaboration.");
          setLoading(false);
          return;
        }

        typingFieldRef.current =
          data.brandId === user.uid
            ? "brandTyping"
            : "influencerTyping";

        setRequestData(data);
        setError("");
      },
      (err) => {
        console.error("Request listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, requestId]);

  // Real-time message listener
  useEffect(() => {
    if (!user || !requestId || requestData?.status !== "accepted") return;

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
        console.error("Chat listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, requestId, requestData?.status]);

  const setTypingState = async (isTyping) => {
    const typingField = typingFieldRef.current;

    if (!typingField || isTypingRef.current === isTyping) {
      return;
    }

    isTypingRef.current = isTyping;
    const writeId = ++typingWriteIdRef.current;

    try {
      await updateDoc(doc(db, "requests", requestId), {
        [typingField]: isTyping,
      });
    } catch (err) {
      console.error("Error updating typing state:", err);
      setError(err.message);

      if (typingWriteIdRef.current === writeId) {
        isTypingRef.current = !isTyping;
      }
    }
  };

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleTextChange = (e) => {
    const nextText = e.target.value;
    setText(nextText);
    clearTypingTimeout();

    if (!nextText.trim()) {
      void setTypingState(false);
      return;
    }

    void setTypingState(true);

    typingTimeoutRef.current = setTimeout(() => {
      void setTypingState(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);

      if (!isTypingRef.current || !typingFieldRef.current) {
        return;
      }

      isTypingRef.current = false;
      updateDoc(doc(db, "requests", requestId), {
        [typingFieldRef.current]: false,
      }).catch((err) => {
        console.error("Error clearing typing state:", err);
      });
    };
  }, [requestId]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim() || !user) {
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
      console.error("Error sending message:", err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  if (error && !requestData) {
    return <p>{error}</p>;
  }

  if (loading) {
    return <p>Loading chat...</p>;
  }

  return (
    <div>
      <h2>Collaboration Chat</h2>

      {requestData && (
        <>
          <p>
            Brand: <strong>{requestData.brandName}</strong>
          </p>

          <p>
            Influencer:{" "}
            <strong>{requestData.influencerName}</strong>
          </p>

          <hr />
        </>
      )}

      <div>
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              <p>
                <strong>
                  {message.senderId === user.uid
                    ? "You"
                    : requestData.brandId === user.uid
                      ? requestData.influencerName
                      : requestData.brandName}
                  :
                </strong>{" "}
                {message.text}
              </p>
            </div>
          ))
        )}
      </div>

      {requestData &&
        (requestData.brandId === user.uid
          ? requestData.influencerTyping
          : requestData.brandTyping) && (
          <p>
            {requestData.brandId === user.uid
              ? requestData.influencerName
              : requestData.brandName}{" "}
            is typing...
          </p>
        )}

      <hr />

      <form onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={handleTextChange}
        />

        <button
          type="submit"
          disabled={sending || !text.trim()}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}
