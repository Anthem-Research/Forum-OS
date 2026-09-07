package org.forum.os;

enum Action {
    ASK(R.id.action_ask, R.id.dot_ask, R.id.assign_ask),
    DRAW(R.id.action_draw, R.id.dot_draw, R.id.assign_draw),
    LOOK(R.id.action_look, R.id.dot_look, R.id.assign_look),
    SYNTHESIS(R.id.action_synthesis, R.id.dot_synthesis, R.id.assign_synthesis),
    PLAY(R.id.action_play, R.id.dot_play, R.id.assign_play);

    final int targetId, dotId, assignmentId;
    Action(int targetId, int dotId, int assignmentId) {
        this.targetId = targetId; this.dotId = dotId; this.assignmentId = assignmentId;
    }
    static Action parse(String value) {
        try { return valueOf(value); } catch (IllegalArgumentException | NullPointerException e) { return ASK; }
    }
}
