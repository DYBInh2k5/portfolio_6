import { markdownify } from "@lib/utils/textConverter";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BsArrowRightShort } from "react-icons/bs";
import { FaEnvelope, FaMapMarkerAlt, FaUserAlt } from "react-icons/fa";
import ImageFallback from "./components/ImageFallback";

const Contact = ({ data }) => {
  const { frontmatter } = data;
  const { title, form_action, phone, mail, location } = frontmatter;
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const hasExternalFormAction = useMemo(
    () => form_action && form_action !== "#",
    [form_action]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (hasExternalFormAction) return;
    e.preventDefault();
    setNotice(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Could not send message right now.");
      }

      setNotice({
        type: "success",
        message: "Message sent successfully. I will reply soon.",
      });
      setFormState({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      if (mail) {
        const subject = encodeURIComponent(
          formState.subject || `Contact from ${formState.name || "Website visitor"}`
        );
        const body = encodeURIComponent(
          `Name: ${formState.name}\nEmail: ${formState.email}\n\n${formState.message}`
        );
        const mailtoUrl = `mailto:${mail}?subject=${subject}&body=${body}`;
        window.location.href = mailtoUrl;
        setNotice({
          type: "success",
          message: "Opening your email app as fallback.",
        });
      } else {
        setNotice({
          type: "error",
          message: error.message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section lg:mt-16">
      <div className="container">
        <div className="row relative pb-16">
          <ImageFallback
            className="-z-[1] object-cover object-top"
            src="/images/map.svg"
            fill
            alt="map bg"
            priority
          />
          <div className="lg:col-6">
            {markdownify(
              title,
              "h1",
              "h1 my-10 text-center lg:my-11 lg:pt-11 lg:text-left lg:text-[64px]"
            )}
          </div>
          <div className="contact-form-wrapper rounded border border-border p-6 dark:border-darkmode-border lg:col-6">
            <h2>
              Send Us A
              <span className="ml-1.5 inline-flex items-center text-primary">
                Message
                <BsArrowRightShort />
              </span>
            </h2>
            {notice && (
              <div
                className={`mt-6 rounded border px-4 py-3 text-sm ${
                  notice.type === "error"
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700"
                }`}
              >
                {notice.message}
              </div>
            )}
            <form
              className="contact-form mt-12"
              method="POST"
              action={form_action}
              onSubmit={handleSubmit}
            >
              <div className="mb-6">
                <label className="mb-2 block font-secondary" htmlFor="name">
                  Full name
                  <small className="font-secondary text-sm text-primary">*</small>
                </label>
                <input
                  className="form-input w-full"
                  name="name"
                  type="text"
                  placeholder="Thomas Milano"
                  value={formState.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="mb-2 block font-secondary" htmlFor="email">
                  Email Address
                  <small className="font-secondary text-sm text-primary">*</small>
                </label>
                <input
                  className="form-input w-full"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={formState.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="mb-2 block font-secondary" htmlFor="subject">
                  Subject
                  <small className="font-secondary text-sm text-primary">*</small>
                </label>
                <input
                  className="form-input w-full"
                  name="subject"
                  type="text"
                  placeholder="Project inquiry"
                  value={formState.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="mb-2 block font-secondary" htmlFor="message">
                  Your Message Here
                  <small className="font-secondary text-sm text-primary">*</small>
                </label>
                <textarea
                  className="form-textarea w-full"
                  name="message"
                  placeholder="Tell me about your project goals and timeline."
                  rows="7"
                  value={formState.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Now"}
              </button>
            </form>
          </div>
        </div>
        <div className="row">
          {phone && (
            <div className="md:col-6 lg:col-4">
              <Link
                href={`tel:${phone}`}
                className="my-4 flex h-[100px] items-center justify-center rounded border border-border p-4 text-primary dark:border-darkmode-border"
              >
                <FaUserAlt />
                <p className="ml-1.5 text-lg font-bold text-dark dark:text-darkmode-light">{phone}</p>
              </Link>
            </div>
          )}
          {mail && (
            <div className="md:col-6 lg:col-4">
              <Link
                href={`mailto:${mail}`}
                className="my-4 flex h-[100px] items-center justify-center rounded border border-border p-4 text-primary dark:border-darkmode-border"
              >
                <FaEnvelope />
                <p className="ml-1.5 text-lg font-bold text-dark dark:text-darkmode-light">{mail}</p>
              </Link>
            </div>
          )}
          {location && (
            <div className="md:col-6 lg:col-4">
              <span className="my-4 flex h-[100px] items-center justify-center rounded border border-border p-4 text-primary dark:border-darkmode-border">
                <FaMapMarkerAlt />
                <p className="ml-1.5 text-lg font-bold text-dark dark:text-darkmode-light">{location}</p>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
