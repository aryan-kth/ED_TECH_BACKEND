const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentId: {
        type: String,
        unique: true
    },
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    }
},{timestamps:true})

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
