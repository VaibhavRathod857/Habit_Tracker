import mongoose from 'mongoose';

const messageActionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    actionType: {
      type: String,
      required: true,
      enum: [
        'start_focus',
        'accept_plan',
        'create_habit',
        'adjust_habit',
        'activate_recovery',
        'exit_recovery',
        'activate_bad_day',
        'exit_bad_day',
        'add_rule',
        'create_stack',
        'record_distraction',
        'create_goal',
        'view_habits',
        'send_reply',
      ],
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    variant: {
      type: String,
      enum: ['primary', 'secondary', 'danger', 'success'],
      default: 'primary',
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isExecuted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const messageWidgetSchema = new mongoose.Schema(
  {
    widgetType: {
      type: String,
      enum: [
        'progress_card',
        'schedule_plan',
        'recovery_plan',
        'habit_proposal',
        'goal_proposal',
        'distraction_card',
        'rule_card',
        'stack_card',
        'checklist',
        'weekly_summary',
      ],
    },
    title: String,
    data: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    actions: [messageActionSchema],
    widget: messageWidgetSchema,
    toolCalls: [
      {
        name: String,
        args: mongoose.Schema.Types.Mixed,
        result: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
