// Memuat data dari localStorage jika ada, atau gunakan data awal/default
let stok = JSON.parse(localStorage.getItem('stok_ibu_risma')) || {
  cupBesar: 0,
  cupKecil: 0,
  kopi: 0,
  creamer: 0
};

let transaksi = JSON.parse(localStorage.getItem('transaksi_ibu_risma')) || [];
let salesChart = null;

// Fungsi Helper untuk Menyimpan Keadaan Terbaru ke Storage
function saveData() {
  localStorage.setItem('stok_ibu_risma', JSON.stringify(stok));
  localStorage.setItem('transaksi_ibu_risma', JSON.stringify(transaksi));
}

// Mengatur visibilitas field jajanan
document.getElementById('produk').addEventListener('change', function () {
  const jajananGroup = document.getElementById('harga-jajanan-group');
  if (this.value === 'jajanan') {
    jajananGroup.style.display = 'block';
    document.getElementById('harga-jajanan').required = true;
  } else {
    jajananGroup.style.display = 'none';
    document.getElementById('harga-jajanan').required = false;
  }
});

// Input Deposit / Modal Owner
document.getElementById('form-topup-deposit').addEventListener('submit', function (e) {
  e.preventDefault();
  const ket = document.getElementById('deposit-ket').value.trim();
  const nominal = parseInt(document.getElementById('deposit-nominal').value);

  if (ket && nominal > 0) {
    const waktu = new Date();
    transaksi.push({
      waktuObj: waktu,
      waktuStr: waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tanggalStr: waktu.toLocaleDateString('id-ID'),
      tipe: 'Deposit Modal',
      keterangan: ket,
      kategori: 'Modal Owner',
      metode: 'Tunai',
      total: nominal
    });

    saveData();
    renderApp();
    this.reset();
  }
});

// Update Tampilan Stok
function updateStokDisplay() {
  document.getElementById('stock-cup-besar').textContent = stok.cupBesar;
  document.getElementById('stock-cup-kecil').textContent = stok.cupKecil;
  document.getElementById('stock-kopi').textContent = stok.kopi;
  document.getElementById('stock-creamer').textContent = stok.creamer;
}

// Tambah Stok Manual
document.getElementById('form-stok').addEventListener('submit', function (e) {
  e.preventDefault();
  const item = document.getElementById('stok-item').value;
  const jumlah = parseInt(document.getElementById('stok-jumlah').value);

  if (item && jumlah > 0) {
    stok[item] += jumlah;
    saveData();
    updateStokDisplay();
    this.reset();
  }
});

// Input Transaksi Penjualan
document.getElementById('form-penjualan').addEventListener('submit', function (e) {
  e.preventDefault();

  const produkVal = document.getElementById('produk').value;
  const jumlah = parseInt(document.getElementById('jumlah').value);
  const metode = document.getElementById('pembayaran').value;

  let namaProduk = "";
  let harga = 0;
  let kategori = "";

  let butuhCupBesar = 0, butuhCupKecil = 0, butuhCreamer = 0, butuhKopi = 0;

  switch (produkVal) {
    case 'cb':
      namaProduk = "Cup Besar";
      harga = 5000;
      kategori = "Teh";
      butuhCupBesar = jumlah;
      break;
    case 'cbc':
      namaProduk = "Cup Besar + Creamer";
      harga = 7000;
      kategori = "Teh";
      butuhCupBesar = jumlah;
      butuhCreamer = jumlah;
      break;
    case 'ck':
      namaProduk = "Cup Kecil";
      harga = 3000;
      kategori = "Teh";
      butuhCupKecil = jumlah;
      break;
    case 'ckc':
      namaProduk = "Cup Kecil + Creamer";
      harga = 8000;
      kategori = "Teh";
      butuhCupKecil = jumlah;
      butuhCreamer = jumlah;
      break;
    case 'creamer':
      namaProduk = "Creamer Add-on";
      harga = 2000;
      kategori = "Teh";
      butuhCreamer = jumlah;
      break;
    case 'kopi':
      namaProduk = "Kopi";
      harga = 4000;
      kategori = "Kopi/Jajanan";
      butuhKopi = jumlah;
      break;
    case 'jajanan':
      namaProduk = "Jajanan";
      harga = parseInt(document.getElementById('harga-jajanan').value) || 0;
      kategori = "Kopi/Jajanan";
      break;
  }

  // Cek kecukupan stok
  if (stok.cupBesar < butuhCupBesar || stok.cupKecil < butuhCupKecil ||
      stok.creamer < butuhCreamer || stok.kopi < butuhKopi) {
    alert("Stok bahan tidak mencukupi untuk transaksi ini!");
    return;
  }

  // Kurangi stok
  stok.cupBesar -= butuhCupBesar;
  stok.cupKecil -= butuhCupKecil;
  stok.creamer -= butuhCreamer;
  stok.kopi -= butuhKopi;
  updateStokDisplay();

  const total = harga * jumlah;
  const waktu = new Date();

  // Simpan Transaksi
  transaksi.push({
    waktuObj: waktu,
    waktuStr: waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    tanggalStr: waktu.toLocaleDateString('id-ID'),
    tipe: 'Penjualan',
    keterangan: `${namaProduk} (${jumlah}x)`,
    kategori: kategori,
    metode: metode,
    total: total
  });

  saveData();
  renderApp();
  this.reset();
  document.getElementById('harga-jajanan-group').style.display = 'none';
});

// Input Pengeluaran
document.getElementById('form-pengeluaran').addEventListener('submit', function (e) {
  e.preventDefault();

  const ket = document.getElementById('pengeluaran-nama').value;
  const nominal = parseInt(document.getElementById('pengeluaran-nominal').value);
  const waktu = new Date();

  transaksi.push({
    waktuObj: waktu,
    waktuStr: waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    tanggalStr: waktu.toLocaleDateString('id-ID'),
    tipe: 'Pengeluaran',
    keterangan: ket,
    kategori: 'Pengeluaran',
    metode: '-',
    total: nominal
  });

  saveData();
  renderApp();
  this.reset();
});

// Kalkulasi Ringkasan & Render Tabel Transaksi
function renderApp() {
  let totalTeh = 0;
  let totalKopiJajanan = 0;
  let totalPengeluaran = 0;
  let totalDepositModal = 0;

  const tbody = document.getElementById('tabel-transaksi');
  tbody.innerHTML = '';

  transaksi.slice().reverse().forEach(t => {
    if (t.tipe === 'Penjualan') {
      if (t.kategori === 'Teh') totalTeh += t.total;
      if (t.kategori === 'Kopi/Jajanan') totalKopiJajanan += t.total;
    } else if (t.tipe === 'Pengeluaran') {
      totalPengeluaran += t.total;
    } else if (t.tipe === 'Deposit Modal') {
      totalDepositModal += t.total;
    }

    const row = document.createElement('tr');
    let warnaTotal = 'green';
    if (t.tipe === 'Pengeluaran') warnaTotal = 'red';
    if (t.tipe === 'Deposit Modal') warnaTotal = 'purple';

    row.innerHTML = `
      <td>${t.tanggalStr} ${t.waktuStr}</td>
      <td><strong>${t.tipe}</strong></td>
      <td>${t.keterangan}</td>
      <td>${t.kategori}</td>
      <td>${t.metode}</td>
      <td style="color: ${warnaTotal}; font-weight: bold;">
        ${t.tipe === 'Pengeluaran' ? '-' : ''}Rp ${t.total.toLocaleString('id-ID')}
      </td>
    `;
    tbody.appendChild(row);
  });

  const totalPendapatanBersih = (totalTeh + totalKopiJajanan) - totalPengeluaran;

  document.getElementById('total-teh').textContent = `Rp ${totalTeh.toLocaleString('id-ID')}`;
  document.getElementById('total-kopi-jajanan').textContent = `Rp ${totalKopiJajanan.toLocaleString('id-ID')}`;
  document.getElementById('total-pengeluaran').textContent = `Rp ${totalPengeluaran.toLocaleString('id-ID')}`;
  document.getElementById('total-deposit-modal').textContent = `Rp ${totalDepositModal.toLocaleString('id-ID')}`;
  document.getElementById('total-pendapatan').textContent = `Rp ${totalPendapatanBersih.toLocaleString('id-ID')}`;

  updateChart();
}

// Grafik Trafik Penjualan Harian
function updateChart() {
  const dailyData = {};

  transaksi.forEach(t => {
    if (t.tipe === 'Penjualan') {
      const tgl = t.tanggalStr;
      if (!dailyData[tgl]) dailyData[tgl] = 0;
      dailyData[tgl] += t.total;
    }
  });

  const labels = Object.keys(dailyData);
  const data = Object.values(dailyData);

  const ctx = document.getElementById('salesChart').getContext('2d');

  if (salesChart) {
    salesChart.destroy();
  }

  salesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Omset Penjualan (Rp)',
        data: data,
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) { return 'Rp ' + value.toLocaleString('id-ID'); }
          }
        }
      }
    }
  });
}

// Inisialisasi awal
updateStokDisplay();
renderApp();
