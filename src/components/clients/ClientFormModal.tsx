'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/ui/Modal';
import { Input } from '@/ui/Input';
import { Textarea } from '@/ui/Textarea';
import { Select, SelectOption } from '@/ui/Select';
import { Button } from '@/ui/Button';
import { Client, ClientStatus } from '@/types';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { ClientStatusBadge } from '@/ui/Badge';

export interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active', badge: <ClientStatusBadge status="active" size="sm" /> },
  { value: 'completed', label: 'Completed', badge: <ClientStatusBadge status="completed" size="sm" /> },
  { value: 'pending', label: 'Pending', badge: <ClientStatusBadge status="pending" size="sm" /> },
  { value: 'inactive', label: 'Inactive', badge: <ClientStatusBadge status="inactive" size="sm" /> },
];

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
}) => {
  const { addClient, updateClient } = useData();
  const toast = useToast();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setCompany(clientToEdit.company || '');
      setEmail(clientToEdit.email || '');
      setPhone(clientToEdit.phone || '');
      setWhatsapp(clientToEdit.whatsapp || '');
      setStatus(clientToEdit.status || 'active');
      setNotes(clientToEdit.notes || '');
    } else {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setWhatsapp('');
      setStatus('active');
      setNotes('');
    }
    setErrors({});
  }, [clientToEdit, isOpen]);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = 'Client name is required';
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (clientToEdit) {
        await updateClient(clientToEdit.id, {
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          status,
          notes: notes.trim(),
        });
        toast.success('Client updated successfully');
      } else {
        await addClient({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          status,
          notes: notes.trim(),
        });
        toast.success('Client added successfully');
      }
      onClose();
    } catch {
      toast.error('Failed to save client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? 'Edit Client' : 'Add New Client'}
      description="Enter the client profile details and contact information."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Client Name"
            placeholder="e.g. Tariq Al-Mansoor"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={isSubmitting}
          />
          <Input
            label="Company Name"
            placeholder="e.g. Apex Media Group"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="client@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isSubmitting}
          />
          <Select
            label="Client Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => setStatus(val as ClientStatus)}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            placeholder="+1 555 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            label="WhatsApp Number"
            placeholder="+15551234567"
            helperText="Include country code for direct chat"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <Textarea
          label="Internal Notes"
          placeholder="Client preferences, communication style, special requirements..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          rows={3}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {clientToEdit ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
