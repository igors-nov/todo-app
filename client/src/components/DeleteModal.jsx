import { DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ModalBase from './ModalBase';

export default function DeleteModal(params) {
  return (
    <ModalBase {...params}>
      <div className="sm:flex items-center justify-center content-center mb-4">
        <div className="mx-auto flex size-12 shrink-0 content-center items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
          <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
        </div>
      </div>
      <div className="sm:flex items-center justify-center content-center">
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <DialogTitle as="h3" className="text-center text-base font-semibold text-gray-900">
            {params.overrideText || 'Are you sure want to delete this item?'}
          </DialogTitle>
        </div>
      </div>
    </ModalBase>
  );
}
