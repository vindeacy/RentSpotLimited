import { Accordion, Container } from "react-bootstrap";

const faqs = [
  {
    question: "How do I register as a tenant or landlord?",
    answer: "Click the Sign Up button on the landing page and select your role during registration."
  },
  {
    question: "How can I search for available properties?",
    answer: "Use the property search feature with filters for location, price, and amenities on the dashboard."
  },
  {
    question: "Can I contact landlords directly?",
    answer: "Yes, you can use the messaging feature or contact details provided on each property listing."
  },
  {
    question: "How do I submit a rental application?",
    answer: "Go to the property details page and click 'Apply'. You can upload required documents securely."
  },
  {
    question: "Is my personal information safe?",
    answer: "Yes, RentSpot uses secure protocols to protect your data and privacy."
  },
  {
    question: "How do I track my rental history?",
    answer: "Your dashboard displays your rental history, lease details, and maintenance requests."
  }
];

export default function Faqs() {
  return (
    <section id="faqs" style={{ background: "#f5f7fa", padding: "40px 0" }}>
      <Container>
        <h2 className="text-center mb-4 fw-bold text-primary">Frequently Asked Questions</h2>
        <Accordion>
          {faqs.map((faq, idx) => (
            <Accordion.Item eventKey={idx.toString()} key={idx}>
              <Accordion.Header>{faq.question}</Accordion.Header>
              <Accordion.Body>{faq.answer}</Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}