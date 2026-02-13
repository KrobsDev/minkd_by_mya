# Lessons Learned

## Session: 2026-02-11

### 1. Don't auto-trigger user actions
- **Mistake**: Added a `useEffect` to auto-click "Pay Now" after booking was created
- **User feedback**: "no. now it glitches and opens and closes automatically. Remove the automatic pay now click"
- **Rule**: Never auto-trigger payment or other important user actions. Let the user initiate them manually.

### 2. Understand the actual problem before fixing
- **Mistake**: Misunderstood "can the paystack modal popup after the booking processing modal has completed" as "auto-open paystack"
- **Actual issue**: The booking modal was blocking the Paystack popup, preventing clicks
- **Rule**: Ask clarifying questions or carefully re-read the issue before implementing. The fix was hiding the modal, not auto-triggering payment.

### 3. Modal layering / z-index conflicts
- **Pattern**: When opening a third-party popup (like Paystack) from within a dialog, the dialog blocks interaction with the popup
- **Solution**: Temporarily hide the parent dialog (`open={open && !tempHideModal}`) while the popup is active, then restore it on callback/close