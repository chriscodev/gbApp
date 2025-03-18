
// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

declare var $;

export async function resetTabSelectedClass() {
  $('table tbody tr').removeClass('selected');
}
