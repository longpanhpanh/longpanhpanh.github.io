/**
 * 1. Render Songs
 * 2. Scroll top
 * 3. Play / Pause / Seek
 * 4. CD Rotate
 * 5. Next / Previous Song
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active Song
 * 9. Scroll active song into view
 * 10. Play song when clicked
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const playlist = $(".playlist");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "MORE",
      singer: "K/DA",
      path: "./assets/songs/song1-MORE.mp3",
      image: "./assets/imgs/kda_more.jpg",
    },
    {
      name: "VILLAIN",
      singer: "K/DA",
      path: "./assets/songs/song2-VILLAIN.mp3",
      image: "./assets/imgs/kda_villain.jpg",
    },
    {
      name: "Crossing Field",
      singer: "LiSA",
      path: "./assets/songs/song3-crossingfield.mp3",
      image: "./assets/imgs/lisa_crossingfield.jpg",
    },
    {
      name: "Astronaut In The Ocean",
      singer: "Masked Wolf",
      path: "./assets/songs/song4-astronauts.mp3",
      image: "./assets/imgs/maskedwolf_astronauts.png",
    },
    {
      name: "Daddy Daddy Doo",
      singer: "鈴木雅之『DADDY ! DADDY ! DO ! feat. 鈴木愛理』",
      path: "./assets/songs/song5-daddydoo.mp3",
      image: "./assets/imgs/kaguya_daddydoo.jpg",
    },
    {
      name: "Stay",
      singer: "KID LAROI ft. Justin Bieber",
      path: "./assets/songs/song6-stay.mp3",
      image: "./assets/imgs/kidLaroi_stay.jpg",
    },
    {
      name: "Monody",
      singer: "The Fat Rat",
      path: "./assets/songs/song7-monody.mp3",
      image: "./assets/imgs/thefatrat_monody.jpg",
    },
    {
      name: "Unity",
      singer: "The Fat Rat",
      path: "./assets/songs/song8-unity.mp3",
      image: "./assets/imgs/thefatrat_unity.jpg",
    },
    {
      name: "Vicestone",
      singer: "Nevada",
      path: "./assets/songs/song9-vicestone.mp3",
      image: "./assets/imgs/nevada_vicestone.jpg",
    },
    {
      name: "Yoru Ni Kakeru",
      singer: "YOASOBI",
      path: "./assets/songs/song10-yorunikakeru.mp3",
      image: "./assets/imgs/yoasobi_yorunikakeru.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
            <div class="song ${
              index === this.currentIndex ? "active" : ""
            }" data-index="${index}">
                <div class="thumb" style="background-image: url('${
                  song.image
                }')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        `;
    });
    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;
    // Xử lý phóng to thu nhỏ cd
    document.onscroll = function () {
      const scrollTop = window.scrollY;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý CD quay và dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // CD quay 10s
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua
    progress.oninput = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // Khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    // Xử lý bật tắt random
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý khi bật tắt repeat
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    //Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào song option
        if (e.target.closest(".option")) {
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho Object
    this.defineProperties();

    // Lắng nghe và xử lý các sự kiện
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy trình duyệt
    this.loadCurrentSong();

    // Render lại playlist
    this.render();

    // Hiển thị trạng thái ban đầu của Button Repeat và Random
    repeatBtn.classList.toggle("active", this.isRepeat);
    randomBtn.classList.toggle("active", this.isRandom);
  },
};

app.start();
