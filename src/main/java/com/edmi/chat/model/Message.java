package com.edmi.chat.model;

public class Message {
    private Type type;
    private String body;
    private String sender;

    public enum Type {
        CHAT,
        JOIN,
        LEAVE
    }

    public Message() {
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }
}
