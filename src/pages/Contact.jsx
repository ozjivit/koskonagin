import { useState } from 'react'
import { submitContact } from '../api'
import { useToast } from '../state/ToastContext.jsx'
import '../App.css'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await submitContact({ name, email, message })
      if (res && res.ok) {
        toast.success('Thanks! Your message has been sent.', { duration: 2000 })
        setName('')
        setEmail('')
        setMessage('')
        // If backend returned a preview URL (Ethereal in dev), log it for dev
        if (res.preview) {
          // eslint-disable-next-line no-console
          console.log('[contact] email preview:', res.preview)
        }
      } else {
        toast.error(res?.error || 'Failed to send message', { duration: 2500 })
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send message', { duration: 2500 })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page">
      <section className="section">
        <h2 className="section-title">Contact Us</h2>
        <div className="contact-card">
          <form className="contact-form" onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="message">Message</label>
              <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" rows={6} required />
            </div>
            <div className="form-actions">
              <button className="btn primary" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send Message'}</button>
            </div>
          </form>
          <div className="contact-aside">
            <div className="contact-aside-title">Get in touch</div>
            <div className="contact-aside-text">We usually reply within 1 business day.</div>
            <div className="contact-aside-list">
              <div>
                <div className="meta-label">Email</div>
                <div className="meta-value"><a href="mailto:tbshop.qa@gmail.com">tbshop.qa@gmail.com</a></div>
              </div>
              <div>
                <div className="meta-label">Phone / WhatsApp</div>
                <div className="meta-value"><a href="https://wa.me/97450279565" target="_blank" rel="noopener noreferrer">+974 5027 9565</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}


