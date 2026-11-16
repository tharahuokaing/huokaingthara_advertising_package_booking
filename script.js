document.addEventListener("DOMContentLoaded", () => {
    const langToggleBtn = document.getElementById("langToggleBtn");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const tierRadios = document.querySelectorAll('input[name="packageTier"]');
    const durationSelect = document.getElementById("durationMonths");
    const addonCheckboxes = document.querySelectorAll(".addon-cb");
    const bookingForm = document.getElementById("packageBookingForm");
    const voucherModal = document.getElementById("voucherModal");
    const voucherDetails = document.getElementById("voucherDetails");
    const closeVoucherBtn = document.getElementById("closeVoucherBtn");
    const htmlRoot = document.documentElement;

    let currentLang = "both"; // 'km', 'en', or 'both'

    // Reach lookup per month (in millions)
    const monthlyReachMap = {
        "Starter Digital Boost": 2,
        "Standard Media & Feed": 10,
        "VIP Production & Video Roll": 25,
        "Global Executive Partner": 50
    };

    // 1. Language Toggle (Khmer / English / Both)
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            if (currentLang === "both") {
                currentLang = "km";
                document.querySelectorAll(".km").forEach(el => el.style.display = "inline-block");
                document.querySelectorAll(".en").forEach(el => el.style.display = "none");
                langToggleBtn.innerText = "🇰🇭 ភាសាខ្មែរ";
            } else if (currentLang === "km") {
                currentLang = "en";
                document.querySelectorAll(".km").forEach(el => el.style.display = "none");
                document.querySelectorAll(".en").forEach(el => el.style.display = "inline-block");
                langToggleBtn.innerText = "🇬🇧 English";
            } else {
                currentLang = "both";
                document.querySelectorAll(".km").forEach(el => el.style.display = "");
                document.querySelectorAll(".en").forEach(el => el.style.display = "");
                langToggleBtn.innerText = "🇰🇭 / EN";
            }
        });
    }

    // 2. Dark / Light Theme Toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = htmlRoot.getAttribute("data-theme");
            if (currentTheme === "dark") {
                htmlRoot.setAttribute("data-theme", "light");
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            } else {
                htmlRoot.setAttribute("data-theme", "dark");
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }
        });
    }

    // 3. Live Order Summary Calculator
    function updateSummary() {
        const selectedTier = document.querySelector('input[name="packageTier"]:checked');
        const tierName = selectedTier.value;
        const baseRate = parseFloat(selectedTier.getAttribute("data-price"));

        const selectedOption = durationSelect.options[durationSelect.selectedIndex];
        const months = parseInt(selectedOption.value, 10);
        const discountRate = parseFloat(selectedOption.getAttribute("data-discount"));

        let addonsTotal = 0;
        addonCheckboxes.forEach(cb => {
            if (cb.checked) {
                addonsTotal += parseFloat(cb.getAttribute("data-cost"));
            }
        });

        const subtotal = baseRate * months;
        const discountAmount = subtotal * discountRate;
        const finalTotal = subtotal - discountAmount + addonsTotal;
        const totalReach = (monthlyReachMap[tierName] || 10) * months;

        document.getElementById("sumTierName").textContent = tierName;
        document.getElementById("sumBaseRate").textContent = `$${baseRate.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        document.getElementById("sumDuration").textContent = `${months} Month${months > 1 ? "s" : ""}`;
        document.getElementById("sumDiscount").textContent = discountAmount > 0
            ? `-$${discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} (${Math.round(discountRate * 100)}%)`
            : "$0.00 (0%)";
        document.getElementById("sumAddons").textContent = `$${addonsTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        document.getElementById("sumTotal").textContent = `$${finalTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        document.getElementById("sumReach").textContent = `${totalReach.toFixed(1)}M+ Views`;

        return { tierName, months, finalTotal, totalReach };
    }

    tierRadios.forEach(radio => radio.addEventListener("change", updateSummary));
    if (durationSelect) durationSelect.addEventListener("change", updateSummary);
    addonCheckboxes.forEach(cb => cb.addEventListener("change", updateSummary));

    // Set default start date to tomorrow
    const startDateInput = document.getElementById("startDate");
    if (startDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        startDateInput.value = tomorrow.toISOString().split("T")[0];
    }

    // Initialize summary on load
    updateSummary();

    // Helper: Validation Error Display
    function validateField(inputEl, message) {
        const group = inputEl.closest(".form-group");
        const errSpan = group.querySelector(".error-msg");
        if (message) {
            group.classList.add("has-error");
            errSpan.textContent = message;
            return false;
        } else {
            group.classList.remove("has-error");
            errSpan.textContent = "";
            return true;
        }
    }

    // 4. Form Submission & Voucher Generation
    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const brandName = document.getElementById("brandName");
            const contactPerson = document.getElementById("contactPerson");
            const contactPhone = document.getElementById("contactPhone");
            const paymentGateway = document.getElementById("paymentGateway");

            let valid = true;
            if (!startDateInput.value) valid = validateField(startDateInput, "សូមជ្រើសរើសថ្ងៃចាប់ផ្តើម / Launch date required.");
            else validateField(startDateInput, "");

            if (!brandName.value.trim()) valid = validateField(brandName, "សូមបញ្ចូលឈ្មោះម៉ាកយីហោ / Brand name required.");
            else validateField(brandName, "");

            if (!contactPerson.value.trim()) valid = validateField(contactPerson, "សូមបញ្ចូលឈ្មោះអ្នកតំណាង / Representative required.");
            else validateField(contactPerson, "");

            if (!contactPhone.value.trim()) valid = validateField(contactPhone, "សូមបញ្ចូលលេខទូរស័ព្ទ / Phone or Telegram required.");
            else validateField(contactPhone, "");

            if (!valid) return;

            const summary = updateSummary();
            const selectedAddons = Array.from(addonCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            const bookingCode = "UHT-BK-" + Math.floor(100000 + Math.random() * 900000);

            voucherDetails.innerHTML = `
                <div><strong>Booking Code:</strong> ${bookingCode}</div>
                <div><strong>Brand / Company:</strong> ${brandName.value.trim()}</div>
                <div><strong>Representative:</strong> ${contactPerson.value.trim()} (${contactPhone.value.trim()})</div>
                <div><strong>Package Tier:</strong> ${summary.tierName}</div>
                <div><strong>Duration & Launch:</strong> ${summary.months} Month(s) starting ${startDateInput.value}</div>
                <div><strong>Add-Ons:</strong> ${selectedAddons.length ? selectedAddons.join(", ") : "None"}</div>
                <div><strong>Payment Method:</strong> ${paymentGateway.value}</div>
                <div><strong>Total Reserved Amount:</strong> <strong style="color: var(--accent-color);">$${summary.finalTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>
            `;

            voucherModal.classList.remove("hidden");
        });
    }

    // 5. Close Voucher Modal
    if (closeVoucherBtn) {
        closeVoucherBtn.addEventListener("click", () => {
            voucherModal.classList.add("hidden");
        });
    }

    if (voucherModal) {
        voucherModal.addEventListener("click", (e) => {
            if (e.target === voucherModal) {
                voucherModal.classList.add("hidden");
            }
        });
    }
});
