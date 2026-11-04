import { supabaseAdmin } from '../lib/supabase';
import { NotificationType, Property, Enquiry, PropertyStatus } from '../types';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  meta?: Record<string, any>;
}

/**
 * Creates an in-app notification record in the database
 */
export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
      meta: params.meta || {},
      is_read: false,
    });

    if (error) {
      console.error('Failed to create notification:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception creating notification:', error);
    return false;
  }
}

/**
 * Notifies a property owner when their property status changes
 */
export async function notifyPropertyStatusChange(
  property: Property,
  oldStatus: PropertyStatus | null,
  newStatus: PropertyStatus,
  reasonOrFeedback?: string
): Promise<void> {
  if (!property.owner_id) return;

  let title = 'Property Status Updated';
  let message = `Your property "${property.title}" status has changed to ${newStatus.replace('_', ' ')}.`;
  let type: NotificationType = 'general';

  switch (newStatus) {
    case 'approved':
      type = 'property_approved';
      title = 'Property Approved! 🎉';
      message = `Great news! Your property "${property.title}" has been approved and is now live on Sasta Plots.`;
      break;
    case 'rejected':
      type = 'property_rejected';
      title = 'Property Listing Rejected';
      message = `Your property "${property.title}" was not approved.${reasonOrFeedback ? ` Reason: ${reasonOrFeedback}` : ''}`;
      break;
    case 'needs_changes':
      type = 'property_needs_changes';
      title = 'Changes Requested for Property Listing';
      message = `Admin requested modifications for "${property.title}".${reasonOrFeedback ? ` Feedback: ${reasonOrFeedback}` : ''}`;
      break;
    case 'suspended':
      type = 'property_suspended';
      title = 'Property Suspended';
      message = `Your property listing "${property.title}" has been suspended.${reasonOrFeedback ? ` Reason: ${reasonOrFeedback}` : ''}`;
      break;
    case 'pending_review':
      type = 'property_submitted';
      title = 'Property Submitted for Review';
      message = `Your property "${property.title}" has been submitted and is currently pending admin review.`;
      break;
  }

  await createNotification({
    userId: property.owner_id,
    type,
    title,
    message,
    link: `/properties/${property.slug}`,
    meta: {
      property_id: property.id,
      property_slug: property.slug,
      old_status: oldStatus,
      new_status: newStatus,
      feedback: reasonOrFeedback,
    },
  });
}

/**
 * Notifies a property owner when a buyer submits an enquiry
 */
export async function notifyNewEnquiry(property: Property, enquiry: Enquiry): Promise<void> {
  if (!property.owner_id) return;

  await createNotification({
    userId: property.owner_id,
    type: 'enquiry_received',
    title: 'New Enquiry Received 📩',
    message: `${enquiry.buyer_name} inquired about your property "${property.title}".`,
    link: `/dashboard/enquiries`,
    meta: {
      enquiry_id: enquiry.id,
      property_id: property.id,
      buyer_name: enquiry.buyer_name,
      buyer_phone: enquiry.buyer_phone,
    },
  });
}

/**
 * Notifies a buyer when a seller/admin responds to their enquiry
 */
export async function notifyEnquiryResponse(enquiry: Enquiry, responseText: string): Promise<void> {
  if (!enquiry.buyer_id) return;

  await createNotification({
    userId: enquiry.buyer_id,
    type: 'enquiry_responded',
    title: 'Response to Your Property Enquiry',
    message: `The seller has responded to your enquiry: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"`,
    link: enquiry.property_id ? `/properties/${enquiry.property_id}` : '/dashboard/enquiries',
    meta: {
      enquiry_id: enquiry.id,
      property_id: enquiry.property_id,
    },
  });
}
