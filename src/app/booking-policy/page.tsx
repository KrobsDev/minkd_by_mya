import { Clock, XCircle, Calendar, AlertTriangle, Baby } from "lucide-react";

export default function BookingPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Booking Policy
          </h1>
          <p className="text-lg text-gray-600">
            Please read our policies carefully before booking your appointment
          </p>
        </div>

        <div className="space-y-8">
          {/* Deposits */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-pink-600">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  DEPOSITS
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 font-bold mt-1">•</span>
                    <span>
                      To book an appointment, a <strong>non-refundable deposit of GHS 100</strong> is required.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-600 font-bold mt-1">•</span>
                    <span>
                      Appointments <strong>without deposits will not be scheduled</strong>.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lateness / No Shows */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-yellow-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  LATENESS / NO SHOWS
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-1">•</span>
                    <span>
                      A <strong>grace period of 20 minutes</strong> is allowed for late arrivals.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-1">•</span>
                    <span>
                      Late arrivals between <strong>20-30 minutes</strong> attract a late fee of <strong>GHS 50</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-1">•</span>
                    <span>
                      Lateness <strong>beyond 30 minutes</strong> warrants an automatic reschedule and <strong>loss of deposit paid</strong>.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cancellation */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-orange-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  CANCELLATION
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-1">•</span>
                    <span>
                      Cancellations require <strong>at least 6-24 hours notice</strong> in order to maintain deposit made.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* No Kids */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-red-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Baby className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  NO KIDS
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    Please note that <strong>children (especially toddlers & babies)</strong> are <strong>not allowed in our studio</strong>.
                  </p>
                  <p>
                    Kindly come along with a guest to watch them if they must be brought in.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-pink-50 rounded-2xl p-8 border-2 border-pink-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Important Notice
                </h3>
                <p className="text-gray-700">
                  By booking an appointment with Mink'd by Mya, you acknowledge that you have read, understood, and agree to abide by all the policies outlined above.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to services button */}
        <div className="mt-12 text-center">
          <a
            href="/services"
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Book an Appointment
          </a>
        </div>
      </div>
    </div>
  );
}